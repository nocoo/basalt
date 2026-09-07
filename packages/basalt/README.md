# @nocoo/basalt

Matte design system component library. ESM, granular exports, Tailwind CSS v4 or standalone CSS.

- **Package:** `@nocoo/basalt`
- **Documentation & Showcase:** [https://basaltui.com](https://basaltui.com)
- **Repository:** [https://github.com/nocoo/basalt](https://github.com/nocoo/basalt)
- **Complete Application Guide:** [ai/INTEGRATION.md](ai/INTEGRATION.md)
- **Compilable AppFrame / Login / Resources:** [ai/RECIPES.md](ai/RECIPES.md)
- **Compatibility & Version Policy:** [ai/COMPATIBILITY.md](ai/COMPATIBILITY.md)

---

## Installation

```bash
npm install @nocoo/basalt lucide-react
# or
bun add @nocoo/basalt lucide-react
```

### Peer Dependencies

- `react`: `^19` (Required)
- `react-dom`: `^19` (Required)
- `lucide-react`: `*` (Required for icons across controls)
- `tailwindcss`: `^4` (Optional; required only if using the Tailwind stylesheet contract)
- `recharts`: `^3` (Optional; required for chart subpaths such as `@nocoo/basalt/charts/*`)
- `react-day-picker`: `^10` (Optional; declared peer for custom calendar integrations; the current DatePicker implementation does not call it)
- `@tanstack/react-table`: `^9` (Optional; declared peer for custom table integrations; the current DataTable implementation does not call it)

> **Note on optional peers:** Basalt's built-in `DatePicker` and `DataTable` operate independently without requiring `react-day-picker` or `@tanstack/react-table`. Only install optional peers when your application directly utilizes them or imports Recharts visualizations.

---

<a id="css-setup"></a>
## Styling Contracts

### Contract 1: Tailwind CSS v4

Import order is strict. Register Basalt tokens before the Tailwind framework imports:

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

- `@nocoo/basalt/styles/tailwind` (or `@nocoo/basalt/styles`): Defines `--basalt-*` design tokens, luminance surfaces (L0/L1/L2), and `--color-basalt-*` utility classes.

### Contract 2: Standalone CSS (No Tailwind)

For projects without Tailwind CSS (e.g. vanilla Vite, legacy frameworks, or Next.js with custom CSS):

```ts
import "@nocoo/basalt/styles/standalone";
```

Standalone CSS contains compiled design tokens, scoped control classes, keyframes, and base surface properties. It does not inject global CSS resets or Preflight. Ensure your container sets `height: 100%`.

---

<a id="component-usage"></a>
## Import Architecture

### 1. Root Barrel (`@nocoo/basalt`)
Contains lightweight base components, inputs, layout surfaces, and providers:
```tsx compile:pkg-readme-root-import
import {
  Button,
  Input,
  LayerCard,
  ThemeProvider,
  ThemeToggle,
  Tooltip,
  Toast,
  Sidebar
} from "@nocoo/basalt";
```

### 2. Granular Subpaths (`@nocoo/basalt/components/*`, `@nocoo/basalt/charts/*`, `@nocoo/basalt/providers/*`)
Keeps initial bundle size small by isolating complex or specialized dependencies:
```tsx compile:pkg-readme-granular-import
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { DonutChart } from "@nocoo/basalt/charts/donut";
import { useTheme } from "@nocoo/basalt/providers/theme";
```

---

## Framework Integration Highlights

### React 19 & Next.js Client Boundaries
Basalt controls require browser event listeners and React context. When using Next.js App Router, render Basalt components within a client module:

```tsx compile:pkg-readme-client-app
// app/basalt-app.tsx
"use client";

import { Button, ThemeProvider } from "@nocoo/basalt";

export function BasaltApp() {
  return (
    <ThemeProvider>
      <Button variant="default">Client Control</Button>
    </ThemeProvider>
  );
}
```

### Server-Side Theme Pre-Hydration
To eliminate theme flashing (FOUC), inject the theme class before React renders:

```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem("theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var isDark = stored === "dark" || (stored !== "light" && prefersDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.classList.toggle("light", !isDark);
      document.documentElement.dataset.mode = isDark ? "dark" : "light";
    } catch (e) {}
  })();
</script>
```

---

## Upgrades & Compatibility Policy

Basalt follows strict [Semantic Versioning (SemVer)](https://semver.org/):
- **PATCH** (`2.0.x`): Bug fixes, internal optimizations, visual refinements that do not break layout contracts.
- **MINOR** (`2.x.0`): New components, additive props, opt-in features, and backward-compatible changes.
- **MAJOR** (`3.0.0`): Breaking changes to public component signatures, DOM/ARIA structures, or removal of deprecated export paths.

All 110 exported entrypoints from `v2.0.3` are locked as a permanent compatibility baseline. See [ai/COMPATIBILITY.md](ai/COMPATIBILITY.md) for full details.

For comprehensive architectural recipes, form adapters, and framework migration instructions, consult the complete package guide at [ai/INTEGRATION.md](ai/INTEGRATION.md).

## License

[MIT](https://opensource.org/licenses/MIT)
