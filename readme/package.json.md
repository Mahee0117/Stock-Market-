# package.json - Project Configuration and Dependencies

This file is the manifest for your Node.js project. It defines metadata, scripts, and all the libraries (dependencies) required to run the app.

## Key Sections

### 1. Metadata
- `"name": "react-example"`: The internal name of the project.
- `"private": true`: Prevents accidental publication to the npm registry.
- `"version": "0.0.0"`: The current version of the app.
- `"type": "module"`: Tells Node.js to use ECMAScript Modules (ESM) by default, allowing the use of `import/export` instead of `require()`.

### 2. Scripts
These are shortcuts for common terminal commands.
- `"dev": "tsx server.ts"`: Starts the development server. `tsx` is a tool that runs TypeScript files directly without a separate compilation step.
- `"build": "vite build"`: Compiles the frontend code into optimized, production-ready static files in the `dist/` folder.
- `"start": "node server.ts"`: Runs the production server.
- `"lint": "tsc --noEmit"`: Checks the code for TypeScript errors without generating any files.

### 3. Dependencies (The Core Libraries)
- **`@google/genai`**: The official SDK for interacting with Google's Gemini AI models.
- **`express`**: The most popular web framework for Node.js, used here to build the backend API.
- **`react` & `react-dom`**: The core libraries for building the user interface.
- **`vite`**: A lightning-fast build tool and development server.
- **`better-sqlite3`**: A fast, synchronous SQLite database driver for Node.js.
- **`yahoo-finance2`**: A library to fetch real-time and historical stock market data from Yahoo Finance.
- **`recharts`**: A composable charting library built on React components.
- **`motion`**: A powerful animation library (formerly Framer Motion) for React.
- **`tailwindcss`**: A utility-first CSS framework for rapid UI development.
- **`lucide-react`**: A collection of beautiful, open-source icons.
- **`dotenv`**: Loads environment variables from a `.env` file into `process.env`.
- **`clsx` & `tailwind-merge`**: Utilities for conditionally joining CSS classes, especially useful with Tailwind.

### 4. DevDependencies (Tools for Development)
- **`@types/*`**: TypeScript type definitions for libraries that don't include them (like Express and Node).
- **`tsx`**: A TypeScript execution engine that makes development faster.
- **`typescript`**: The TypeScript compiler itself.
- **`autoprefixer`**: A CSS post-processor that adds vendor prefixes (like `-webkit-`) to ensure cross-browser compatibility.
