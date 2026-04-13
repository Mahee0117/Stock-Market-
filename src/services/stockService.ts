export interface StockPrediction {
  predictedPrice: number;
  direction: 'UP' | 'DOWN';
  confidence: number;
  insights: string;
  technicalAnalysis: string;
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
