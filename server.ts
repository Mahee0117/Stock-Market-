import express from "express";
import { createServer as createViteServer } from "vite";
import YahooFinance from 'yahoo-finance2';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

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
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      db: db ? "connected" : "failed",
      env: {
        hasApiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  app.get("/api/stocks/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const { period = '1y' } = req.query;

    try {
      console.log(`Fetching data for ${symbol}...`);
      // Try to fetch from Yahoo Finance
      const endDate = new Date();
      const startDate = new Date();
      if (period === '1mo') startDate.setMonth(endDate.getMonth() - 1);
      else if (period === '6mo') startDate.setMonth(endDate.getMonth() - 6);
      else if (period === '1y') startDate.setFullYear(endDate.getFullYear() - 1);
      else if (period === '5y') startDate.setFullYear(endDate.getFullYear() - 5);

      const result = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      }) as any[];

      if (!result || result.length === 0) {
        throw new Error("No data returned from Yahoo Finance");
      }

      // Store in DB (upsert)
      const insert = db.prepare(`
        INSERT OR REPLACE INTO stock_data (symbol, date, open, high, low, close, volume)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction((data) => {
        for (const row of data) {
          try {
            const dateStr = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            insert.run(symbol, dateStr, row.open, row.high, row.low, row.close, row.volume);
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

  app.post("/api/predictions/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const { predicted_price, direction, confidence, insights } = req.body;
    
    const predictionDate = new Date().toISOString().split('T')[0];
    
    const insert = db.prepare(`
      INSERT INTO predictions (symbol, prediction_date, predicted_price, direction, confidence, insights)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(symbol, predictionDate, predicted_price, direction, confidence, insights);
    res.json({ success: true });
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
