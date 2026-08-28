# @nocoo/basalt

Basalt component library. ESM, granular exports, Tailwind v4 or standalone CSS.

## Tailwind

Import order is required:

```css
@source "../node_modules/@nocoo/basalt/dist/**/*.{js,jsx,ts,tsx}";
@import "@nocoo/basalt/styles/tailwind";
@import "tailwindcss";
```

`./styles` points at the Tailwind contract. Basalt `@theme` tokens must register before `tailwindcss`.

## Standalone (no Tailwind)

```ts
import "@nocoo/basalt/styles/standalone";
```

Standalone has no Preflight and no html/body reset.

## Components

```ts
import { Button, ThemeProvider } from "@nocoo/basalt";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { DonutChart } from "@nocoo/basalt/charts/donut";
```

Root barrel is small leaves + providers. Charts, DatePicker, and DataTable stay on granular paths with optional peers.
