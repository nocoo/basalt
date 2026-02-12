# basalt

> **Dense. Refined. Functional.**
> A personal finance dashboard built with a matte design system and 3-tier luminance hierarchy.

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Framework: Vite](https://img.shields.io/badge/Framework-Vite-646cff.svg?style=flat-square&logo=vite)](https://vite.dev)
[![Style: Tailwind](https://img.shields.io/badge/Style-Tailwind_CSS-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

![Basalt Preview](https://assets.lizheng.me/wp-content/uploads/2026/02/basalt-1-scaled.jpg)

## Overview

**Basalt** is a fully functional personal finance dashboard demo, showcasing a design system inspired by the fine-grained volcanic rock. It features 14 pages, 12 dashboard widgets, skeuomorphic credit card visuals, and a dual-mode (light/dark) theme with calculated contrast ratios.

## Design Philosophy

* **3-Tier Luminance Hierarchy:** Body (L0) → Content panel (L1) → Inner cards (L2), defining depth through luminance rather than borders.
* **Subdued, not dim.** Calculated contrast ratios ensure readability without eye strain in both light and dark modes.
* **Precision engineered.** Inter 14px base typography, DM Sans display headings, 1.5px stroke icons.
* **Fluid Geometry.** 12px base radius with generous negative space.

## Features

* **Dual Theme:** Full light and dark mode with CSS variable tokens, system preference detection, and 3-state toggle (system → light → dark).
* **12 Dashboard Widgets:** Total balance, income, spending trend, expense breakdown (donut), weekly activity (area), savings goal (radial), credit score (radial), monthly comparison (grouped bar), recent transactions, quick actions, and more.
* **Skeuomorphic Cards:** Credit cards rendered with ISO 7810 aspect ratio (85.6×53.98mm), EMV chip, NFC icon, and network logos (Visa, Mastercard, Amex).
* **8-Color Chart Palette:** Sequential visualization palette with boosted saturation in dark mode, centralized via `src/lib/palette.ts`.
* **48 shadcn/ui Components:** Full set of accessible primitives built on Radix UI.
* **Command Palette:** Global search via `⌘K` powered by cmdk.
* **Responsive Layout:** Collapsible sidebar on desktop, overlay drawer on mobile with backdrop blur.

## Pages

| Route | Description |
|---|---|
| `/` | Main dashboard with 12 widget cards |
| `/wallet` | Multi-account wallet balances and activity |
| `/cards` | Credit card gallery with realistic skeuomorphic design |
| `/transactions` | Transaction list with filters (table on desktop, cards on mobile) |
| `/budget` | Budget categories with progress bars and monthly chart |
| `/goals` | Savings goals with progress tracking |
| `/analytics` | Income vs expenses, spending breakdown, 6-month trends |
| `/cash-flow` | Inflow/outflow area chart and net flow analysis |
| `/investments` | Portfolio performance, allocation donut, holdings table |
| `/help` | Resource cards and FAQ accordion |
| `/settings` | Profile, notifications, security, and appearance tabs |
| `/palette` | Design system color showcase for all chart types |
| `/login` | Standalone login page with decorative gradients |

## Tech Stack

| Layer | Technology |
|---|---|
| **Build** | [Vite 5](https://vite.dev) + SWC |
| **UI** | [React 18](https://react.dev) + TypeScript 5.8 |
| **Routing** | [React Router 6](https://reactrouter.com) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com) + tailwindcss-animate |
| **Components** | [shadcn/ui](https://ui.shadcn.com) (48 primitives) |
| **Charts** | [Recharts 2](https://recharts.org) |
| **Icons** | [Lucide React](https://lucide.dev) (1.5px stroke) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Testing** | [Vitest 3](https://vitest.dev) + Testing Library |
| **Package Manager** | [Bun](https://bun.sh) |

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server (port 7017)
bun dev

# Build for production
bun run build

# Run tests
bun test
```

## License

[MIT](https://opensource.org/licenses/MIT)
