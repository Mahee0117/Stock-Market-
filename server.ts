import express from "express";
import { createServer as createViteServer } from "vite";
import YahooFinance from 'yahoo-finance2';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Force load from .env if process.env is empty or placeholder (handles AI Studio environment overrides)
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined' || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
  try {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=["']?(.*?)["']?(\n|$)/);
    if (match && match[1]) {
      process.env.GEMINI_API_KEY = match[1].trim();
    }
  } catch (e) {
    // .env might not exist or be readable
  }
}

console.log('API Key present:', !!process.env.GEMINI_API_KEY);

const yahooFinance = new YahooFinance();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('stocks.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS stock_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT,
    date TEXT,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    volume INTEGER,
    UNIQUE(symbol, date)
  );
  
  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT,
    prediction_date TEXT,
    predicted_price REAL,
    direction TEXT,
    confidence REAL,
    insights TEXT,
    technical_analysis TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrations: Add technical_analysis column if it doesn't exist
try {
  db.prepare("ALTER TABLE predictions ADD COLUMN technical_analysis TEXT").run();
} catch (e) {
  // Column likely already exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Verify DB
  try {
    db.prepare('SELECT 1').get();
    console.log('Database connected successfully');
  } catch (e) {
    console.error('Database connection failed:', e);
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      db: db ? "connected" : "failed",
      env: {
        hasApiKey: !!apiKey && apiKey.length > 10 && apiKey !== 'MY_GEMINI_API_KEY',
        apiKeyPrefix: apiKey ? apiKey.substring(0, 4) : null,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  app.get("/api/stocks/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const { period = '1y' } = req.query;

    try {
      console.log(`Fetching data for ${symbol}...`);
      
      const endDate = new Date();
      // Use yesterday as the end for historical to avoid "null" issues with today's open candle
      const historicalEndDate = new Date();
      historicalEndDate.setDate(historicalEndDate.getDate() - 1);
      
      const startDate = new Date();
      if (period === '1mo') startDate.setMonth(endDate.getMonth() - 1);
      else if (period === '6mo') startDate.setMonth(endDate.getMonth() - 6);
      else if (period === '1y') startDate.setFullYear(endDate.getFullYear() - 1);
      else if (period === '5y') startDate.setFullYear(endDate.getFullYear() - 5);

      // Fetch both historical and current quote for the most "real" experience
      const [historicalResult, quoteResult] = await Promise.allSettled([
        yahooFinance.historical(symbol, {
          period1: startDate,
          period2: historicalEndDate,
          interval: '1d'
        }, { validateResult: false }),
        yahooFinance.quote(symbol)
      ]);

      let result: any[] = [];
      
      if (historicalResult.status === 'fulfilled' && Array.isArray(historicalResult.value)) {
        result = historicalResult.value.filter(row => 
          row && row.close !== null && row.close !== undefined && row.date !== null
        );
      }

      // Add the live quote as the final data point if available
      if (quoteResult.status === 'fulfilled' && quoteResult.value) {
        const q: any = quoteResult.value;
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Only add if we don't already have today's data (unlikely with historicalEndDate being yesterday)
        if (!result.some(row => {
          const d = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
          return d === todayStr;
        })) {
          result.push({
            date: new Date(),
            open: q.regularMarketOpen || q.regularMarketPreviousClose || q.regularMarketPrice,
            high: q.regularMarketDayHigh || q.regularMarketPrice,
            low: q.regularMarketDayLow || q.regularMarketPrice,
            close: q.regularMarketPrice,
            volume: q.regularMarketVolume || 0
          });
        }
      }

      if (result.length === 0) {
        throw new Error("No valid data returned from Yahoo Finance");
      }

      // Sort by date to ensure correct order after adding quote
      result.sort((a, b) => {
        const da = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const db = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return da - db;
      });

      // Store in DB (upsert)
      const insert = db.prepare(`
        INSERT OR REPLACE INTO stock_data (symbol, date, open, high, low, close, volume)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction((data) => {
        for (const row of data) {
          try {
            const dateStr = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            insert.run(symbol, dateStr, row.open, row.high, row.low, row.close, row.volume || 0);
          } catch (e) {
            // Ignore
          }
        }
      });

      transaction(result);
      res.json({ data: result, isSimulated: false });
    } catch (error: any) {
      console.error("Error fetching stock data:", error);
      
      // Fallback 1: check DB
      const rows = db.prepare('SELECT * FROM stock_data WHERE symbol = ? ORDER BY date ASC').all(symbol);
      if (rows.length > 0) {
        console.log(`Returning ${rows.length} rows from database fallback`);
        return res.json({ data: rows, isSimulated: false });
      }

      // Fallback 2: Generate Mock Data if everything fails (to keep app functional)
      console.log("Generating mock data fallback...");
      const mockData = [];
      let lastPrice = 150 + Math.random() * 50;
      for (let i = 100; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const change = (Math.random() - 0.5) * 5;
        lastPrice += change;
        mockData.push({
          date: date.toISOString().split('T')[0],
          open: lastPrice - Math.random() * 2,
          high: lastPrice + Math.random() * 2,
          low: lastPrice - Math.random() * 2,
          close: lastPrice,
          volume: Math.floor(Math.random() * 10000000) + 5000000
        });
      }
      res.json({ data: mockData, isSimulated: true });
    }
  });

  app.get("/api/predictions/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const prediction = db.prepare('SELECT * FROM predictions WHERE symbol = ? ORDER BY created_at DESC LIMIT 1').get(symbol);
    res.json(prediction || null);
  });

  app.post("/api/predict", async (req, res) => {
    const { symbol, historicalData } = req.body;
    
    if (!symbol || !historicalData || !Array.isArray(historicalData)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isInvalid = !apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'undefined' || apiKey.length < 10;
    
    if (isInvalid) {
      return res.status(500).json({ 
        error: "Gemini API Key is missing. To fix this in AI Studio: 1. Click the 'Secrets' icon (key) in the sidebar. 2. Add a new secret named 'GEMINI_API_KEY'. 3. Paste your key from aistudio.google.com/app/apikey. 4. Refresh the app." 
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Prepare a summary of the data for the model
      const summary = historicalData.slice(-30).map(d => ({
        date: d.date,
        close: d.close,
        volume: d.volume
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: `Analyze the following historical stock data for ${symbol} and provide a prediction for the next trading day. 
        Data (last 30 days): ${JSON.stringify(summary)}
        
        Provide your analysis in JSON format with the following fields:
        - predictedPrice: number (estimated next day close)
        - direction: "UP" or "DOWN"
        - confidence: number (0 to 1)
        - insights: string (brief summary of the trend)
        - technicalAnalysis: string (detailed reasoning based on indicators like SMA, RSI, etc.)`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              predictedPrice: { type: Type.NUMBER },
              direction: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              insights: { type: Type.STRING },
              technicalAnalysis: { type: Type.STRING },
            },
            required: ["predictedPrice", "direction", "confidence", "insights", "technicalAnalysis"],
          },
        },
      });

      if (!response.text) {
        throw new Error("Empty response from AI model");
      }

      const prediction = JSON.parse(response.text);
      
      // Save to DB
      const predictionDate = new Date().toISOString().split('T')[0];
      const insert = db.prepare(`
        INSERT INTO predictions (symbol, prediction_date, predicted_price, direction, confidence, insights, technical_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      insert.run(symbol, predictionDate, prediction.predictedPrice, prediction.direction, prediction.confidence, prediction.insights, prediction.technicalAnalysis);

      res.json(prediction);
    } catch (error: any) {
      console.error("Prediction failed:", error);
      
      let errorMessage = "AI Prediction failed. Please try again later.";
      
      // Check for specific Gemini API errors
      try {
        const errorBody = JSON.parse(error.message);
        if (errorBody.error?.reason === 'API_KEY_INVALID' || errorBody.error?.status === 'INVALID_ARGUMENT') {
          errorMessage = "The Gemini API Key provided is invalid. Please check your API key configuration.";
        }
      } catch (e) {
        if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("key not valid")) {
          errorMessage = "The Gemini API Key provided is invalid. Please check your API key configuration.";
        }
      }

      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
