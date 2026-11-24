# Basalt Agent Setup Playbook

Install and configure `@nocoo/basalt` in a React 19 application.

## 1. Install Package

```bash
bun add @nocoo/basalt
# or: npm install @nocoo/basalt
```

Requires `react` `^19` and `react-dom` `^19`. Built-in `DatePicker` and `DataTable` work standalone; install `recharts` only when rendering charts.

## 2. Configure Stylesheet Contract

### Option A: Tailwind CSS v4

```css
@import "@nocoo/basalt/styles";
@import "tailwindcss";
```

### Option B: Standalone CSS (No Tailwind)

```ts
import "@nocoo/basalt/styles/standalone";
```

## 3. Optional Self-Hosted Fonts

```ts
import "@nocoo/basalt/fonts.css";
```

## 4. Mount Root Providers and Toaster

Wrap the application root with `ThemeProvider`, optional `LinkProvider` (for React Router or Next.js `Link`), and a single `<Toaster />`.
In Next.js, isolate interactive provider wrappers and Basalt client components inside `"use client"` modules.

## 5. Persist Agent Rules

Fetch https://basaltui.com/agents.md and append its `<!-- basalt:start -->` ... `<!-- basalt:end -->` block to your repository's `AGENTS.md` or `CLAUDE.md`.

## 6. Verify Typecheck and Build

Run your project's TypeScript typecheck and production build to confirm imports, styles, and SSR/client boundaries compile cleanly.
