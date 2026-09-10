# Basalt AI & Machine Usage Guide

This document describes how AI code assistants, automated agents, and developers can consume `@nocoo/basalt` (v2.1.7).

---

## 1. Machine Registry Entrypoint

The complete, machine-readable component registry and API surface is published within the installed npm package at file:
`node_modules/@nocoo/basalt/ai/registry.json` (relative package path: `ai/registry.json`).
*(Note: `ai/registry.json` is a published file within the npm package directory, not an imported JavaScript/ESM export subpath.)*
Document anchors formatted as `ai/registry.json#<slug>` reference specific catalog entries within the `catalogEntries` array by matching the `slug` property (e.g. `ai/registry.json#button` matches the entry where `slug === "button"`).

It contains:
- **122 Exported Modules** (1 root barrel, components, charts, providers)
- **111 Ready Catalog Entries** with full API definitions
- **741 Public Symbols** (395 runtime values, 346 TypeScript types)
- **Detailed Component API**: Props, types, defaults, descriptions, and function callable signatures (including all `toast()` variants)
- **Exact Peer Dependency Closures**: Identifies optional peers required per subpath (e.g., Recharts)

---

## 2. Reading Original Component Sources From Installed Package

Basalt distributes complete TypeScript source code embedded directly inside the published package artifacts:
- **Compiled Modules**: Full TypeScript source code is embedded in the `sourcesContent` field of individual sourcemaps under `node_modules/@nocoo/basalt/dist/<subpath>.js.map`.
- **Pure Re-Export Modules**: Modules without an independent sourcemap (such as pure re-export modules) are preserved verbatim with integrity hashes in `node_modules/@nocoo/basalt/ai/sources.json`. The root entrypoint `@nocoo/basalt` still emits full JavaScript exports in `dist/index.js`.

Inspect `ai/registry.json` or the component's catalog metadata to identify the exact package read location and expected SHA-256 integrity hash for each module. Do not attempt to read from unbundled repository source paths or unreleased remote git tags.

---

## 3. Component Import Conventions

### Root Import vs. Granular Subpaths
Basalt supports both lightweight root imports and tree-shakeable granular subpaths:

```tsx compile:usage-import-conventions
// Root import for standard components
import { Button, Input, LayerCard, Dialog, Toaster, toast } from "@nocoo/basalt";

// Granular subpaths for visualization, calendar pickers, and tables
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { Sparkline } from "@nocoo/basalt/charts/sparkline";

export function ImportConventionsDemo() {
  return (
    <div>
      <Button variant="default">Root Button</Button>
      <DatePicker aria-label="Target Date" />
    </div>
  );
}
```

### Optional Peer Dependency Rules
- **Recharts**: Required ONLY when using chart subpaths (`@nocoo/basalt/charts/*`). Root imports and basic UI do not import Recharts.
- **DatePicker & DataTable**: Built-in implementations operate standalone without requiring `react-day-picker` or `@tanstack/react-table`.

---

## 4. Styling Setup

### Tailwind CSS v4 Contract
```css
@import "@nocoo/basalt/styles/tailwind";
@import "tailwindcss";
```

### Standalone CSS Contract (No Tailwind)
```ts
import "@nocoo/basalt/styles/standalone";
```

---

## 5. Toast Notification Architecture

Mount a single `<Toaster />` globally at the root of your application (without an id):
```tsx compile:usage-toast-architecture
import type React from "react";
import { Toaster, toast, Button } from "@nocoo/basalt";

export function App() {
  return (
    <>
      <Toaster />
      <Button onClick={() => toast.success("Project saved")}>Save</Button>
    </>
  );
}
```

## 6. Application recipes and palette preferences

Read [RECIPES.md](RECIPES.md) for complete AppFrame, Login, and Resources modules. Each module is compiled and exercised from the installed tarball in standalone, Tailwind, and Next.js consumers. These recipes keep authentication, routing, data and network requests in the application.

Read [INTEGRATION.md#accent-provider](INTEGRATION.md#accent-provider) for the twelve control accents, optional `paletteOverrides`, and the fixed five-color chart cycle matching the classic candy swatches with its existing gray retained. Check [COMPATIBILITY.md](COMPATIBILITY.md) before migrating old color indices or stored IDs. The catalog at https://basaltui.com/palette provides an application-owned editor with localStorage persistence.
