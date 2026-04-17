# index.html - The Entry Point

This is the main HTML file that serves as the skeleton for your Single Page Application (SPA).

## Line-by-Line Explanation

### Line 1: `<!doctype html>`
- **What is it?**: The Document Type Declaration.
- **Why is it there?**: It tells the browser that this is an HTML5 document. Without it, browsers might enter "quirks mode" and render things incorrectly.

### Line 2: `<html lang="en">`
- **What is it?**: The root element of the HTML page.
- **Why is it there?**: `lang="en"` specifies that the primary language of the document is English. This is crucial for accessibility (screen readers) and Search Engine Optimization (SEO).

### Line 3: `<head>`
- **What is it?**: A container for metadata (data about data).
- **Why is it there?**: It holds information that isn't displayed on the page itself but is used by the browser and search engines.

### Line 4: `<meta charset="UTF-8" />`
- **What is it?**: Character encoding declaration.
- **Why is it there?**: `UTF-8` is the standard character set that includes almost all characters from all human languages. It prevents "garbled" text (mojibake).

### Line 5: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
- **What is it?**: Viewport configuration for responsive design.
- **Why is it there?**: 
  - `width=device-width`: Sets the width of the page to follow the screen-width of the device.
  - `initial-scale=1.0`: Sets the initial zoom level when the page is first loaded.
  - **Minute Detail**: This is the most important tag for making a website look good on mobile phones.

### Line 6: `<title>My Google AI Studio App</title>`
- **What is it?**: The title of the web page.
- **Why is it there?**: It appears in the browser tab and is used as the title in search engine results.

### Line 7: `</head>`
- **What is it?**: Closing tag for the head section.

### Line 8: `<body>`
- **What is it?**: The container for all visible content on the web page.

### Line 9: `<div id="root"></div>`
- **What is it?**: An empty `div` element with a unique ID.
- **Why is it there?**: This is the "mount point" for the entire React application. React will take control of this element and inject all the UI components into it.

### Line 10: `<script type="module" src="/src/main.tsx"></script>`
- **What is it?**: A script tag that loads the JavaScript/TypeScript entry point.
- **Why is it there?**:
  - `type="module"`: Tells the browser to treat the script as an ES Module, allowing the use of `import` and `export` statements.
  - `src="/src/main.tsx"`: Points to the main TypeScript file. Vite (the build tool) will intercept this request, compile the TypeScript into JavaScript on the fly, and serve it to the browser.

### Line 11: `</body>`
- **What is it?**: Closing tag for the body section.

### Line 12: `</html>`
- **What is it?**: Closing tag for the entire HTML document.
