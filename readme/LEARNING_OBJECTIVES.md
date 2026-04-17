# What You Will Learn from This Project

This project is a full-stack financial analysis application that combines real-time stock data, local database persistence, and AI-driven forecasting. By studying this codebase, you will learn:

## 1. Full-Stack Architecture (Express + Vite)
- How to integrate a modern React frontend (Vite) with a Node.js backend (Express) in a single repository.
- How to serve static assets and handle API requests in the same server.
- The difference between client-side and server-side execution.

## 2. Real-Time Data Integration
- How to use the `yahoo-finance2` library to fetch live market data.
- Handling asynchronous data fetching and state management in React.
- Implementing "Simulated Data" fallbacks for when markets are closed or APIs fail.

## 3. Database Management (SQLite)
- Using `better-sqlite3` for high-performance, synchronous database operations in Node.js.
- Designing relational tables for time-series data (stock prices) and predictions.
- Implementing "Upsert" (Insert or Replace) logic to maintain data integrity.

## 4. AI & Generative Language (Gemini API)
- Integrating the `@google/genai` SDK on the server.
- Engineering prompts for structured JSON output from an LLM.
- Handling API security by keeping keys on the server and using environment variables.
- Implementing robust error handling for AI services.

## 5. Modern Frontend Development
- **React 19 Hooks**: Using `useState`, `useEffect`, and `useMemo` for complex UI logic.
- **Data Visualization**: Using `Recharts` to build interactive, responsive financial charts.
- **Styling**: Using `Tailwind CSS` for utility-first design and `lucide-react` for iconography.
- **Animations**: Using `motion` (Framer Motion) for smooth UI transitions and loading states.

## 6. Security Best Practices
- Environment variable management using `dotenv`.
- Sanitizing and validating user input on the server.
- Protecting sensitive API keys from being exposed to the client.

## 7. TypeScript Mastery
- Defining interfaces for complex data structures (Stock data, Predictions).
- Using Type assertions and guards to ensure code reliability.
- Configuring `tsconfig.json` for a full-stack environment.
