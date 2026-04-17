# tsconfig.json - TypeScript Configuration

This file tells the TypeScript compiler how to translate your code into JavaScript.

## Key Options Explained

### `"target": "ES2022"`
- **What is it?**: The version of JavaScript to output.
- **Why?**: ES2022 is a modern version that supports features like top-level `await` and private class fields.

### `"module": "ESNext"`
- **What is it?**: The module system to use.
- **Why?**: `ESNext` uses the latest standard for `import` and `export`, which is required for Vite's fast performance.

### `"lib": ["ES2022", "DOM", "DOM.Iterable"]`
- **What is it?**: Tells TypeScript which built-in APIs are available.
- **Why?**: 
  - `DOM`: Allows you to use things like `document.getElementById`.
  - `ES2022`: Allows modern JavaScript features.

### `"moduleResolution": "bundler"`
- **What is it?**: How TypeScript finds files you import.
- **Why?**: This is the modern standard for tools like Vite and Webpack. It allows you to import files without always specifying the `.ts` extension.

### `"jsx": "react-jsx"`
- **What is it?**: How to handle JSX (the HTML-like code in React).
- **Why?**: `react-jsx` tells TypeScript to use the modern React 17+ transformation, which doesn't require you to `import React` in every single file.

### `"paths": { "@/*": ["./*"] }`
- **What is it?**: Path mapping.
- **Why?**: This matches the alias we set in `vite.config.ts`. It tells TypeScript that `@/` refers to the root folder, so it doesn't show red squiggly lines when you use that shortcut.

### `"noEmit": true`
- **What is it?**: Prevents TypeScript from generating `.js` files.
- **Why?**: Because Vite handles the actual conversion to JavaScript, we only use TypeScript for "Type Checking" (finding errors).
