import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface StockPrediction {
  predictedPrice: number;
  direction: 'UP' | 'DOWN';
  confidence: number;
  insights: string;
  technicalAnalysis: string;
}

export async function getStockPrediction(symbol: string, historicalData: any[]): Promise<StockPrediction> {
  // Prepare a summary of the data for the model
  const summary = historicalData.slice(-30).map(d => ({
    date: d.date,
    close: d.close,
    volume: d.volume
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  return JSON.parse(response.text);
}

export function calculateIndicators(data: any[]) {
  if (data.length < 50) return data;

  return data.map((d, i) => {
    // SMA 20
    let sma20 = null;
    if (i >= 19) {
      const slice = data.slice(i - 19, i + 1);
      sma20 = slice.reduce((acc, curr) => acc + curr.close, 0) / 20;
    }

    // SMA 50
    let sma50 = null;
    if (i >= 49) {
      const slice = data.slice(i - 49, i + 1);
      sma50 = slice.reduce((acc, curr) => acc + curr.close, 0) / 50;
    }

    // RSI 14
    let rsi = null;
    if (i >= 14) {
      let gains = 0;
      let losses = 0;
      for (let j = i - 13; j <= i; j++) {
        const diff = data[j].close - data[j - 1].close;
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      const rs = (gains / 14) / (losses / 14 || 1);
      rsi = 100 - (100 / (1 + rs));
    }

    // Bollinger Bands (20, 2)
    let bbUpper = null;
    let bbLower = null;
    if (i >= 19 && sma20) {
      const slice = data.slice(i - 19, i + 1);
      const variance = slice.reduce((acc, curr) => acc + Math.pow(curr.close - sma20, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);
      bbUpper = sma20 + 2 * stdDev;
      bbLower = sma20 - 2 * stdDev;
    }

    return {
      ...d,
      sma20,
      sma50,
      rsi,
      bbUpper,
      bbLower
    };
  });
}
