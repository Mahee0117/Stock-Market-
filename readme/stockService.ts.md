# src/services/stockService.ts - Technical Analysis Logic

This file contains the mathematical logic for calculating financial indicators used in the charts and by the AI.

## Line-by-Line Explanation

### Lines 1-7: `StockPrediction` Interface
- **What is it?**: A TypeScript definition for the AI prediction object.
- **Why is it there?**: It ensures that whenever we use a "prediction" in our code, it has exactly these fields (`predictedPrice`, `direction`, etc.). This prevents "undefined" errors.

### Line 9: `calculateIndicators` Function
- **What is it?**: A data transformation function.
- **Why is it there?**: It takes raw stock prices and adds calculated values (SMA, RSI, etc.) to each data point.

### Lines 14-18: Simple Moving Average (SMA 20)
- **What is it?**: The average price over the last 20 days.
- **Why is it there?**: It "smooths out" price fluctuations to show the short-term trend.
- **Deep Detail**: Traders use the SMA 20 as a "support" or "resistance" line. If the price is above it, the trend is generally bullish.

### Lines 21-25: SMA 50
- **What is it?**: The average price over the last 50 days.
- **Why is it there?**: Shows the medium-term trend.
- **Minute Detail**: When the SMA 20 crosses above the SMA 50, it's called a "Golden Cross" – a very strong buy signal.

### Lines 28-39: Relative Strength Index (RSI 14)
- **What is it?**: A momentum oscillator that measures the speed and change of price movements.
- **Why is it there?**: It tells you if a stock is "Overbought" (RSI > 70) or "Oversold" (RSI < 30).
- **Deep Research**: The formula `100 - (100 / (1 + RS))` is the standard way to normalize price momentum into a 0-100 scale.

### Lines 42-50: Bollinger Bands
- **What is it?**: A volatility indicator consisting of a middle band (SMA 20) and two outer bands.
- **Why is it there?**: 
  - The outer bands are 2 standard deviations away from the SMA.
  - **Minute Detail**: 95% of price action typically happens *inside* these bands. If the price touches the upper band, it's considered "expensive" relative to its recent average.

### Lines 52-60: Return Statement
- **What is it?**: Merges the original data point with the new indicators.
- **Why is it there?**: It uses the "Spread Operator" (`...d`) to keep all existing fields (date, close, etc.) and adds the new calculated fields.
