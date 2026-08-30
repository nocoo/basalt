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

Standalone has no Preflight and no html/body reset. It is compiled tokens + the utilities used by shipped controls + namespaced keyframes. Rebuild with `bun scripts/build-basalt-standalone.ts`.

## Components

```ts
import { Button, ThemeProvider } from "@nocoo/basalt";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { DonutChart } from "@nocoo/basalt/charts/donut";
```

Root barrel is small leaves + providers. Charts, DatePicker, and DataTable stay on granular paths.

Optional peer ranges for those granular entrypoints:

- `recharts` `^3` — used by chart modules such as `DonutChart`
- `react-day-picker` `^10` — declared for DatePicker consumers; the current DatePicker implementation does not call it
- `@tanstack/react-table` `^9` — declared for DataTable consumers; the current DataTable implementation does not call it

Install the matching library in the consumer when you use that granular path. Tailwind `^4` remains optional for the Tailwind stylesheet contract.
