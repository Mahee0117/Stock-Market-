# src/index.css - Global Styles and Theming

This file defines the visual identity of the application using Tailwind CSS and custom CSS rules.

## Line-by-Line Explanation

### Line 1: `@import url(...)`
- **What is it?**: Google Fonts import.
- **Why is it there?**: It loads three distinct font families:
  - **Inter**: For clean, readable UI text.
  - **JetBrains Mono**: For technical data and code-like elements.
  - **Playfair Display**: A sophisticated serif font for headings.

### Line 2: `@import "tailwindcss";`
- **What is it?**: The entry point for Tailwind CSS.
- **Why is it there?**: It injects all of Tailwind's utility classes into the project.

### Lines 4-8: `@theme`
- **What is it?**: Tailwind CSS theme configuration.
- **Why is it there?**: It maps the imported Google Fonts to Tailwind's font utility classes (`font-sans`, `font-mono`, `font-serif`).

### Lines 10-14: `@layer base`
- **What is it?**: Base style overrides.
- **Why is it there?**: 
  - `bg-[#0A0A0A]`: Sets a very dark, near-black background for a "premium" dark mode feel.
  - `text-white`: Sets the default text color to white.
  - `antialiased`: Makes fonts look smoother on modern screens.

### Lines 16-18: `.glass-card`
- **What is it?**: A custom utility class for the "Glassmorphism" effect.
- **Why is it there?**:
  - `bg-white/5`: A very subtle, semi-transparent white background.
  - `backdrop-blur-xl`: Blurs the content behind the card, creating a frosted glass effect.
  - `border-white/10`: A thin, subtle border to define the card's edges.

### Lines 20-23: `.data-grid`
- **What is it?**: A custom background pattern.
- **Why is it there?**:
  - `radial-gradient(...)`: Creates a subtle grid of tiny dots.
  - `background-size: 24px 24px`: Controls the spacing of the dots.
  - **Minute Detail**: This is a common design pattern in "SaaS" and "FinTech" apps to make the background feel more technical and structured.
