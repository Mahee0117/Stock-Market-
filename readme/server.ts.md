# server.ts - The Backend Engine

This file is the heart of your application's backend. It handles API requests, database operations, and communication with external services like Yahoo Finance and Gemini AI.

## Line-by-Line Explanation

### Imports (Lines 1-9)
- `express`: The web framework used to create the server and define routes.
- `createViteServer`: Allows Express to use Vite as middleware, enabling features like Hot Module Replacement (HMR) during development.
- `YahooFinance`: A library for fetching stock market data.
- `Database`: The `better-sqlite3` driver for managing the local SQLite database.
- `path` & `fileURLToPath`: Node.js utilities for handling file and directory paths.
- `GoogleGenAI`: The SDK for interacting with Google's Gemini AI.
- `dotenv`: Loads environment variables from a `.env` file.
- `fs`: The Node.js File System module, used here for manual `.env` reading.

### Environment Setup (Lines 11-26)
- `dotenv.config()`: Initializes environment variable loading.
- **Lines 14-24**: A custom check to ensure the `GEMINI_API_KEY` is loaded. In some environments, standard `dotenv` might fail, so this manually reads the `.env` file as a fallback.
- `console.log(...)`: Logs whether the API key was successfully found (useful for debugging).

### Database Initialization (Lines 32-58)
- `new Database('stocks.db')`: Creates or opens a local SQLite database file named `stocks.db`.
- `db.exec(...)`: Runs SQL commands to create two tables if they don't exist:
  1. `stock_data`: Stores historical price information (Open, High, Low, Close, Volume).
  2. `predictions`: Stores AI-generated forecasts.

### The `startServer` Function (Lines 60-336)
This asynchronous function sets up and starts the Express server.

#### Middleware (Line 64)
- `app.use(express.json())`: Enables the server to parse JSON data sent in the body of POST requests.

#### API Route: Health Check (Lines 75-87)
- `GET /api/health`: Returns the status of the server, database connection, and API key presence. Used for monitoring.

#### API Route: Fetch Stock Data (Lines 89-206)
- `GET /api/stocks/:symbol`:
  - **Lines 96-115**: Calculates date ranges and fetches both historical data and the current live quote from Yahoo Finance using `Promise.allSettled`.
  - **Lines 119-144**: Filters and merges the results into a single array of data points.
  - **Lines 158-174**: Uses a **Database Transaction** to efficiently save the new data into the SQLite database. `INSERT OR REPLACE` ensures we don't have duplicate dates for the same stock.
  - **Lines 179-204**: **Error Handling & Fallbacks**. If the API fails, it first tries to return data from the local database. If the database is empty, it generates "Mock Data" so the app doesn't crash.

#### API Route: Get Latest Prediction (Lines 208-212)
- `GET /api/predictions/:symbol`: Retrieves the most recent AI prediction for a specific stock from the database.

#### API Route: Generate AI Prediction (Lines 214-302)
- `POST /api/predict`:
  - **Lines 221-228**: Validates the API key before making a request to Google.
  - **Lines 234-238**: Summarizes the last 30 days of stock data to send to the AI.
  - **Lines 240-264**: Calls `gemini-1.5-flash`.
    - **Prompt Engineering**: The prompt asks for a specific JSON structure.
    - **Response Schema**: Uses `responseMimeType: "application/json"` and a `responseSchema` to force the AI to return perfectly formatted JSON that the code can parse.
  - **Lines 275-280**: Saves the AI's prediction into the database for future reference.

#### Vite & Static Serving (Lines 320-331)
- **Development Mode**: Uses `vite.middlewares` so that frontend changes are reflected instantly.
- **Production Mode**: Serves the pre-compiled files from the `dist` folder.

#### Server Start (Lines 333-335)
- `app.listen(...)`: Starts the server on port 3000 and listens for incoming connections from any IP address (`0.0.0.0`).
