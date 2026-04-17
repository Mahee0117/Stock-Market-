# vite.config.ts - Build Tool Configuration

Vite is the tool that compiles your code, handles the development server, and optimizes your app for production.

## Line-by-Line Explanation

### Line 1-4: Imports
- `tailwindcss`: Integrates Tailwind CSS with Vite.
- `react`: The official Vite plugin for React support (enables JSX and Fast Refresh).
- `path`: Node.js utility for handling file paths.
- `defineConfig`: A helper function that provides auto-completion for the configuration object.

### Line 6: `export default defineConfig(({mode}) => {`
- **What is it?**: The configuration wrapper.
- **Why is it there?**: It allows us to access the current `mode` (e.g., 'development' or 'production').

### Line 7: `const env = loadEnv(mode, '.', '');`
- **What is it?**: Loads environment variables.
- **Why is it there?**: It reads your `.env` file so that the build tool can use those variables.

### Line 9: `plugins: [react(), tailwindcss()]`
- **What is it?**: Activates the React and Tailwind plugins.

### Lines 10-12: `define`
- **What is it?**: Global constant replacement.
- **Why is it there?**: It "injects" the `GEMINI_API_KEY` into the client-side code during the build process. 
- **Minute Detail**: This is how the browser can access `process.env.GEMINI_API_KEY` even though `process` is a Node.js-only object.

### Lines 13-17: `resolve.alias`
- **What is it?**: Path aliasing.
- **Why is it there?**: It allows you to use `@/` as a shortcut for the root directory in your import statements, making them cleaner.

### Lines 18-22: `server.hmr`
- **What is it?**: Hot Module Replacement configuration.
- **Why is it there?**: In this specific environment (AI Studio), HMR is sometimes disabled to prevent the screen from flickering while the AI is writing code.
