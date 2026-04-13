# StockVision AI 📈

> **AI-powered stock analysis and forecasting platform** — real-time market data, technical indicators, and Gemini-driven price predictions in a single full-stack application.

---

## Overview

StockVision AI is a full-stack web application that fetches live stock data, computes technical indicators on the frontend, and uses the **Google Gemini API** to generate next-day price predictions with directional confidence and a natural-language technical analysis summary.

The app is designed with **resilience in mind** — a three-layer data fallback ensures it never shows a blank screen, whether the Yahoo Finance API is available or not.

---

## Features

- **Live Market Data** — Fetches real-time quotes and historical OHLCV data via `yahoo-finance2`
- **Technical Indicators** — Computes SMA20, SMA50, RSI(14), and Bollinger Bands entirely on the client
- **AI Price Prediction** — Sends the last 30 days of data to Gemini 1.5 Flash and receives a structured JSON forecast: target price, direction (UP/DOWN), confidence score, investor insight, and technical analysis
- **Persistent Storage** — Stores fetched stock data and predictions in a local SQLite database using `better-sqlite3`
- **Three-Layer Data Fallback**
  1. Live data from Yahoo Finance API
  2. Cached data from SQLite (if API fails)
  3. Procedurally generated mock data (maintains UI functionality in offline/demo mode)
- **Responsive UI** — Dark-themed, glassmorphism dashboard with animated charts (Recharts + Framer Motion)
- **Risk Panel** — Live RSI signal (Overbought / Oversold / Neutral), MA crossover status, and volatility index

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Recharts, Framer Motion |
| **Backend** | Node.js, Express, TypeScript (`tsx` for dev) |
| **Database** | SQLite via `better-sqlite3` |
| **AI** | Google Gemini 1.5 Flash (`@google/genai`) |
| **Market Data** | `yahoo-finance2` |
| **Build Tool** | Vite 6 |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   React Frontend                │
│  App.tsx → fetchData() → calculateIndicators()  │
│  Charts: Price (Area), RSI (Line), Volume (Bar) │
└────────────────────┬────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────┐
│               Express Backend (server.ts)        │
│                                                  │
│  GET /api/stocks/:symbol                         │
│    ├─ [1] Yahoo Finance (live)                   │
│    ├─ [2] SQLite cache (fallback)                │
│    └─ [3] Mock data generator (last resort)      │
│                                                  │
│  POST /api/predict                               │
│    └─ Gemini 1.5 Flash → structured JSON         │
│                                                  │
│  GET/POST /api/predictions/:symbol               │
│    └─ SQLite read/write                          │
└─────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/stockvision-ai.git
cd stockvision-ai

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
cp .env.example .env.local
# Edit .env.local and set: GEMINI_API_KEY=your_key_here

# 4. Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (`tsx`) |
| `npm run build` | Build frontend for production |
| `npm start` | Run production server (`node server.ts`) |
| `npm run lint` | TypeScript type check |

---

## How the AI Prediction Works

When you click **"Run Prediction Model"**, the app:


1. Sends the last 30 days of OHLCV data for the selected symbol to `/api/predict`
2. The server calls Gemini 1.5 Flash with a structured prompt requesting a JSON response
3. Gemini returns: `predictedPrice`, `direction`, `confidence`, `insights`, `technicalAnalysis`
4. The prediction is saved to SQLite and displayed on the dashboard

Gemini uses a **structured output schema** (`responseSchema` with `responseMimeType: "application/json"`) to guarantee a parseable response — no regex needed.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server + DB health check |
| `GET` | `/api/stocks/:symbol` | Fetch OHLCV data (with fallback chain) |
| `POST` | `/api/predict` | Generate AI price prediction |
| `GET` | `/api/predictions/:symbol` | Retrieve latest saved prediction |

---

## Project Structure

```
stockvision-ai/
├── server.ts              # Express backend + DB + AI routes
├── src/
│   ├── App.tsx            # Main React component + all UI
│   ├── services/
│   │   └── stockService.ts  # Technical indicator calculations
│   └── lib/
│       └── utils.ts       # cn(), formatCurrency(), formatNumber()
├── index.html
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

---

## Key Design Decisions

**Why a three-layer fallback?**
Yahoo Finance's unofficial API can be rate-limited or unavailable. By cascading to the SQLite cache and then to generated mock data, the app stays fully interactive during demos — a critical consideration for a portfolio project.

**Why SQLite and not a cloud database?**
Zero-configuration local persistence keeps the setup to a single `npm install`. The schema is simple (two tables) and all writes are transactional, making it portable and reliable without any external dependencies.

**Why structured output from Gemini?**
Using `responseSchema` forces the model to return a valid JSON object matching an exact shape. This eliminates parsing errors and makes the AI output as reliable as a typed API response.

---

## Disclaimer

This application is built for **educational and portfolio purposes only**. It does not constitute financial advice. Stock markets involve significant risk — always consult a qualified financial advisor before making investment decisions.

---

## License

MIT
