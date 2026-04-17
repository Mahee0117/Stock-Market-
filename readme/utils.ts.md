# src/lib/utils.ts - Utility Functions

This file contains helper functions that are used throughout the application to keep the code clean and reusable.

## Line-by-Line Explanation

### Lines 1-2: Imports
- `clsx`: A utility for constructing `className` strings conditionally.
- `twMerge`: A utility that intelligently merges Tailwind CSS classes, resolving conflicts (e.g., if you have `px-2` and `px-4`, it ensures only one is applied).

### Lines 4-6: `cn` (Class Name) Function
- **What is it?**: A standard helper used in almost all modern Tailwind + React projects.
- **Why is it there?**: It allows you to write cleaner code when you need to apply classes based on a condition.
- **Example**: `cn("text-white", isActive && "text-emerald-500")`.

### Lines 8-13: `formatCurrency` Function
- **What is it?**: A wrapper around the built-in `Intl.NumberFormat` API.
- **Why is it there?**: It formats a raw number (like `150.5`) into a pretty currency string (like `$150.50`).
- **Minute Detail**: Using `Intl.NumberFormat` is better than manual string manipulation because it automatically handles different locales and currency symbols correctly.

### Lines 15-20: `formatNumber` Function
- **What is it?**: Another formatter for large numbers.
- **Why is it there?**: 
  - `notation: 'compact'`: This turns a large number like `1,000,000` into `1M`.
  - `maximumFractionDigits: 1`: Ensures we don't show too many decimals (e.g., `1.2M` instead of `1.234567M`).
  - **Why?**: This is crucial for financial dashboards where space is limited and "readability at a glance" is the priority.
