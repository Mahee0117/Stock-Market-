# src/App.tsx - The Main Frontend Component

This file is the primary React component that defines the user interface and logic for the StockVision AI application.

## Line-by-Line Explanation

### Imports (Lines 1-32)
- **React Hooks**: `useState` (for data that changes), `useEffect` (for side effects like fetching data), `useMemo` (for performance optimization).
- **Lucide Icons**: Imports various icons like `TrendingUp`, `Search`, and `Cpu` to make the UI visually appealing.
- **Recharts**: A library for drawing the stock charts (`AreaChart`, `LineChart`, `BarChart`).
- **Motion**: Used for smooth entrance animations and transitions.
- **Services & Utils**: 
  - `calculateIndicators`: A custom function to calculate technical indicators like RSI and SMA.
  - `cn`: A utility for merging CSS classes.
  - `formatCurrency` & `formatNumber`: Helpers for pretty-printing data.

### Constants (Lines 34-35)
- `DEFAULT_SYMBOL`: The stock that loads by default (Apple).
- `SYMBOLS`: A list of popular stock tickers for the quick-access buttons.

### State Management (Lines 38-45)
- `symbol`: The current stock being viewed.
- `data`: The array of historical stock prices.
- `loading`: Tracks if the app is currently fetching data.
- `prediction`: Stores the AI forecast result.
- `predicting`: Tracks if the AI is currently thinking.
- `error`: Stores any error messages to show the user.
- `isSimulated`: Tracks if the data is real or mock data.

### Data Fetching Logic (Lines 47-95)
- `fetchData`: An asynchronous function that calls our backend API (`/api/stocks/${targetSymbol}`).
- **Line 64**: After fetching, it runs the data through `calculateIndicators` to add technical analysis values.
- **Lines 69-87**: It also checks the database for any *existing* predictions for this stock so the user doesn't have to regenerate them.

### AI Prediction Logic (Lines 101-134)
- `handlePredict`: Sends the last 30 days of stock data to the server's AI endpoint (`/api/predict`).
- It updates the `prediction` state with the AI's target price, direction, and insights.

### Derived Calculations (Lines 136-141)
- Calculates the current price, price change, and percentage change for the header stats.
- `chartData`: Uses `useMemo` to slice the last 100 days of data for the chart, ensuring this calculation only runs when the data actually changes.

### The UI Structure (Lines 144-518)

#### Header (Lines 146-195)
- Contains the app logo, "Simulated Data" badge, search bar, and quick-access stock buttons.
- **Line 172**: The search bar updates the `symbol` state when the user presses "Enter".

#### Error & Loading States (Lines 198-230)
- Shows a red alert box if something goes wrong.
- Shows a spinning icon while data is loading.

#### Top Stats Grid (Lines 233-314)
- Displays the current price, 24h volume, AI prediction status, and a "Market Sentiment" progress bar.

#### Main Chart Area (Lines 317-409)
- **Price Analysis**: A large area chart showing the stock price over time with SMA lines.
- **RSI Momentum**: A smaller chart showing the Relative Strength Index (overbought/oversold signals).
- **Trading Volume**: A bar chart showing how many shares were traded each day.

#### Sidebar / Insights (Lines 412-507)
- **AI Forecast Card**: Displays the AI's target price and detailed technical reasoning.
- **Risk Assessment**: A quick summary of market volatility and signals.

#### Footer (Lines 513-517)
- Contains a financial disclaimer.
