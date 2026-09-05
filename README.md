# Basalt

> Matte design system, UI component library, and documentation catalog.  
> npm: [`@nocoo/basalt`](https://www.npmjs.com/package/@nocoo/basalt) · Live showcase: [`https://basalt.hexly.ai`](https://basalt.hexly.ai)

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Framework: Vite](https://img.shields.io/badge/Framework-Vite-646cff.svg?style=flat-square&logo=vite)](https://vite.dev)
[![Style: Tailwind](https://img.shields.io/badge/Style-Tailwind_CSS-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

## Overview

**Basalt** is a dual-purpose repository:
1. **`@nocoo/basalt`** (`packages/basalt`): An ESM design system library with 110 entrypoints, subpath exports, calculated luminance hierarchy, and support for both Tailwind CSS v4 and zero-dependency standalone CSS.
2. **Catalog Showcase Site** (repo root): A complete documentation, catalog browser (`/ui`), and scenario library with 24 example dashboard pages and over 240 interactive component scenarios.

## Design Philosophy

* **3-Tier Luminance Hierarchy:** Base body (L0) → Content island (L1) → Inner cards and surfaces (L2), establishing tactile depth through matte luminance rather than borders.
* **Subdued, not dim:** Measured contrast ratios across light and dark modes with dedicated semantic color roles.
* **Precision engineered:** Inter typography, DM Sans display headings, consistent 1.5px stroke Lucide icons.
* **Granular ESM Architecture:** Lightweight core barrel for common controls + granular subpaths for complex charts and heavy widgets to keep bundles lean.

## Library Quickstart

### Installation

```bash
# Install package and icon peer
bun add @nocoo/basalt lucide-react
# or npm install @nocoo/basalt lucide-react
```

### CSS Setup

#### Option A: With Tailwind CSS v4 (Recommended)

In your main CSS file, import Basalt tokens before Tailwind:

```css
@source "../node_modules/@nocoo/basalt/dist/**/*.{js,jsx,ts,tsx}";
@import "@nocoo/basalt/styles/tailwind";
@import "tailwindcss";

@layer base {
  html, body, #root {
    height: 100%;
  }
  body {
    @apply bg-basalt-background text-basalt-foreground antialiased;
  }
}
```

#### Option B: Standalone CSS (No Tailwind)

```ts
import "@nocoo/basalt/styles/standalone";
```

Standalone CSS packages design tokens, control surface utilities, and keyframes without injecting global resets or preflight.

### Component Usage

```tsx
import { Button, LayerCard, ThemeProvider } from "@nocoo/basalt";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { DonutChart } from "@nocoo/basalt/charts/donut";

export function App() {
  return (
    <ThemeProvider>
      <LayerCard>
        <LayerCard.Header>
          <span className="font-semibold text-basalt-foreground">Overview</span>
        </LayerCard.Header>
        <LayerCard.Body>
          <DatePicker aria-label="Select Date" />
          <DonutChart data={[{ name: "Usage", value: 75 }]} />
          <Button variant="default">Submit</Button>
        </LayerCard.Body>
      </LayerCard>
    </ThemeProvider>
  );
}
```

See [INTEGRATION.md](INTEGRATION.md) for full application frame recipes, Next.js client boundaries, SSR theme initialization, and form handling.

## Example Pages in Showcase

The showcase site demonstrates Basalt across 24 realistic domain dashboards and layout scenarios:

| Route | Focus / Template |
|---|---|
| `/` | Analytics Dashboard with card grids and KPI stat strips |
| `/accounts` | Multi-account wallet balances, cards, and recent activity |
| `/progress-tracking` | Budget category tracking and progress meters |
| `/flow-comparison` | Inflow/outflow comparison and financial flow charts |
| `/portfolio` | Asset allocation donut, portfolio performance, holdings |
| `/components` | Showcase wall of reusable card blocks and widgets |
| `/forms` | Form layouts, inputs, switches, radios, and validation patterns |
| `/navigation` | Pagers, breadcrumbs, command palette, and step flows |
| `/interactive` | Dialogs, sheets, context menus, tooltips, and toasts |
| `/data` | Tables, filters, search, and tabular records |
| `/layout` | 3-tier surface hierarchy (L0 / L1 / L2 / Wells) |
| `/dialogs` | Confirm dialogs, forms in dialogs, and nested overlays |
| `/chat` | Chat inbox, streaming bubbles, composers, and dock |
| `/settings` | Profile, notifications, security, and appearance tabs |
| `/palette` | Accent color picker and visual chart palette system |
| `/interactions` | Native forms, toasts, and confirmation flow demo |
| `/health` | Health dashboard with slot bars and timelines |
| `/wearable` | Wearable device vitals, metrics, and activity charts |
| `/banking` | Financial analytics, cash flow, and banking metrics |
| `/network` | Network telemetry and operations monitoring |
| `/login` | Standalone badge-style authentication screen |
| `/static-page` | Clean reading layout for legal or markdown content |
| `/loading` | Full-screen and card skeleton loading states |
| `/ui` | Interactive component catalog with live props, source, and docs |

## Repository Architecture

```
src/
  pages/          Catalog, UI documentation, and 24 dashboard example pages
  components/     Site chrome and showcase-specific layout components
  viewmodels/     Showcase viewmodels (MVVM; no direct View/DOM imports)
  models/         Mock catalog data and types
  lib/            Client utilities, version constants, and i18n
packages/
  basalt/         Public npm package (@nocoo/basalt)
    src/
      components/ UI components and compound surfaces
      charts/     Visualization primitives and charts
      providers/  Theme, Accent, and Link providers
      utils/      Styling and focus/indicator helpers
docs/             Architecture guides, reviews, and maturity programs
fixtures/         External consumer test fixtures (Tailwind, Standalone, Next.js, Heavy)
scripts/          Catalog generators, consumer gates, and release automation
```

## Developer Commands

```bash
# Start local development server (port 7003)
bun dev

# Run full type checking across app, scripts, and package
bun run typecheck

# Lint with Biome
bun run lint

# Build showcase site for production
bun run build

# Run unit and behavior tests with 95% coverage requirement
bun run test:coverage

# Run complete package prepublish verification gate (10 steps)
bun run package:prepublish

# Release workflow (main branch and CI success gated)
bun run release
```

## Documentation & Policies

- [INTEGRATION.md](INTEGRATION.md) — Complete application chrome, SSR, forms, and migration guide.
- [Public API & Compatibility Policy](packages/basalt/ai/COMPATIBILITY.md) — SemVer contracts, exports manifest, and lifecycle policies.
- [CLAUDE.md](CLAUDE.md) — Contributor and agent handbook.

## License

[MIT](https://opensource.org/licenses/MIT)
