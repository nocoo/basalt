# Basalt Public API and Compatibility Policy

This document defines the stability contracts, export architecture, and semantic versioning guarantees for `@nocoo/basalt`.

---

## 1. Compatibility Baseline

The initial public baseline is locked to version **`2.0.3`** (commit `e61efc1`).

- **Entrypoints:** 110 exported entrypoints:
  - 1 root entrypoint: `@nocoo/basalt` (96 root symbols)
  - 77 component subpaths: `@nocoo/basalt/components/*`
  - 29 chart subpaths: `@nocoo/basalt/charts/*`
  - 3 provider subpaths: `@nocoo/basalt/providers/*` (`theme`, `accent`, `link`)
  - Total: 572 exported symbols across all entrypoints (375 runtime symbols, 197 type symbols).
- **CSS Export Contracts:** 3 export paths:
  - `@nocoo/basalt/styles` (Tailwind contract alias)
  - `@nocoo/basalt/styles/tailwind` (Tailwind token definition)
  - `@nocoo/basalt/styles/standalone` (Zero-dependency compiled tokens and utility CSS)

### Machine Verification
All 110 entrypoints, their export targets, 3 CSS paths, and all 572 exported symbols (with value/type fidelity) are cataloged in `packages/basalt/public-api-baseline.json` and verified via `packages/basalt/scripts/verify-public-api.ts`. No entrypoint or public symbol present in this baseline may be removed or have its value/type identity degraded without a major version bump.

---

## 2. Export Architecture & Root vs. Granular Principles

### Root Barrel (`@nocoo/basalt`)
The root barrel is reserved for lightweight, frequently-used leaves, standard inputs, core surfaces, and global providers.
- **Included on root:** `Button`, `Input`, `Checkbox`, `Radio`, `Switch`, `Badge`, `Text`, `Label`, `Separator`, `LayerCard`, `DescriptionList`, `Sidebar`, `Dialog`, `Sheet`, `Popover`, `Tooltip`, `Toast`, `ThemeProvider`, `ThemeToggle`, `LinkProvider`.
- **Excluded from root:**
  - Heavy visualization libraries (`@nocoo/basalt/charts/*`)
  - Complex table implementations (`@nocoo/basalt/components/data-table`)
  - Calendar pickers with complex date logic (`@nocoo/basalt/components/date-picker`)
  - Application frame layout chrome (`@nocoo/basalt/components/app-shell`, `app-header`, `page-header`, `section-rule`)

### Wildcard Subpaths & Legacy Internal Helpers
<a id="wildcard-subpaths"></a>
In `v2.0.3`, wildcard exports (`./components/*`, `./charts/*`, `./providers/*`) exposed all non-test modules in the package, including internal building blocks:
- **`@nocoo/basalt/components/typeahead-field`**: Internal composite input controller for autocomplete and combobox (`TypeaheadField`, `TypeaheadItem`). Provides popup list and keyboard navigation wiring.
- **`@nocoo/basalt/components/overlay`**: Internal class generators and styling constants for overlay menus and select (`overlayPanelClass`, `overlayItemClass`, `FOCUS_RING`, `FOCUS_BORDER`, `MENU_GAP`, `OVERLAY_GAP`, `OVERLAY_LAYER`, `OVERLAY_MOTION`).
- **`@nocoo/basalt/charts/sample`**: Static mock datasets used for fallback preview rendering (`SAMPLE`, `BULLET_SAMPLE`, `DONUT_SAMPLE`, `FUNNEL_SAMPLE`, `RADAR_SAMPLE`, `SANKEY_SAMPLE`).

**Policy:**
1. In accordance with zero-breaking-change guarantees, **no existing export path will be removed in 2.x**.
2. Internal modules are marked as `@internal` or `@legacy` in documentation and metadata.
3. Callers should import public controls via their designated official export paths.

---

## 3. Semantic Versioning Rules

Basalt strictly follows [SemVer 2.0.0](https://semver.org/):

| Change Level | Permitted Changes | Examples |
|---|---|---|
| **PATCH** (`2.0.x`) | Backward-compatible bug fixes, internal optimizations, visual refinements that do not alter layout bounding boxes or break existing snapshots. | Fixing event propagation in `Button`, correcting border contrast ratio, fixing broken types. |
| **MINOR** (`2.x.0`) | Additive, backward-compatible features; new components, new optional props, new granular export paths. | Adding a new `FilterBar` component, introducing an optional `variant` prop to `Badge`. |
| **MAJOR** (`3.0.0`) | Breaking changes to existing public component signatures, DOM/ARIA structures, or removal of deprecated export paths. | Renaming required props, removing legacy wildcard subpaths, updating peer dependency minimums to React 20. |

### Layout & Default Geometry Policy
Changes to default geometry (such as outer padding, default margins, or intrinsic dimensions) alter the visual balance of consuming applications.
- **Bug Fixes vs Breaking Changes:** Correcting an unintended layout collapse or overflow bug (e.g., popup clipping in cards or chart height collapsing to 0px) is considered a patch/minor fix. Altering default container padding (e.g. changing `LayerCard` padding from `none` to `md`) affects caller assumptions.
- If default geometry must evolve, before/after migration notes must be published in `CHANGELOG.md`, and backward-compatible props or opt-ins must be offered.

---

## 4. Contract Dimensions & Current Implementation Status

1. **Import Contract:** Subpaths mapped in `package.json` `"exports"` and declaration `.d.ts` entrypoints are immutable within a major version. (Fully Enforced)
2. **State & Controlled Contract:** Components supporting controlled usage (`value`, `checked`, `open`) must reliably notify callers via corresponding callbacks (`onValueChange`, `onCheckedChange`, `onOpenChange`). Uncontrolled usage with default props (`defaultValue`, `defaultOpen`) must manage internal state seamlessly.
3. **Form Contract & Known Limitations:** Standard inputs (`Input`, `InputArea`, `Checkbox`, `Radio`, `Switch`) participate in `FormData` extraction. Known limitations: `DatePicker` custom ref overrides and `Autocomplete` free-text blur committing are slated for complete behavior isolation; native reset and required validation boundaries are scheduled for hardening.
4. **Accessibility Contract:** Components follow WAI-ARIA authoring practices. Semantic roles and `aria-*` attributes are maintained. Focus traps and keyboard navigations are incrementally hardened across component milestones.
5. **Reduced Motion:** Components with motion support respect `@media (prefers-reduced-motion: reduce)`. Streaming caret, loading spinners, and pulse states have known coverage gaps scheduled for uniform alignment.

---

## 5. Chart Configuration and Series Subsystems

Basalt chart components build upon modular configuration tokens and series utilities designed for Recharts integration.

<a id="chart-config"></a>
### Chart Configuration (`@nocoo/basalt/charts/config`)
Defines shared tokens, styles, and props for cartesian charts:
- **Constants**:
  - `CHART_TYPE`: Font sizes (`axisFontSize: 11`, `legendFontSize: 12`, `tooltipTitleSize: 12`, `tooltipBodySize: 12`), `tooltipDot: 8`, stroke width (`strokeWidth: 2`), `gridDash: "3 3"`, `gridOpacity: 0.15`, and `areaFillAlpha: 0.2`.
  - `AXIS_CONFIG` & `cartesianAxisProps(hidden: boolean = false)`: Standard tick styling (`chartTickStyle("axis")`), `axisLine: false`, `tickLine: false`. Returns `{ hide: boolean, tick: { fontSize: number, fill: string }, axisLine: false, tickLine: false }`.
  - `GRID_PROPS`: Horizontal-only grid with theme stroke opacity and dashed strokes (`vertical: false, stroke: chartAxis, strokeOpacity: 0.15, strokeDasharray: "3 3"`).
  - `BAR_RADIUS`: Rounded corner coordinates for vertical (`[4, 4, 0, 0]`) and horizontal (`[0, 4, 4, 0]`) bars.
  - `ANIMATION_PROPS`: Standard zero-animation config for stable rendering (`isAnimationActive: false`).
  - `CHART_TOOLTIP_CURSOR_LINE` / `CHART_TOOLTIP_CURSOR_BAR`: Standard cursor overlays.
  - `RESPONSIVE_CONTAINER_PROPS`: Sizing props (`width: "100%"`, `height: "100%"`, `minWidth: 0`, `minHeight: 0`, `debounce: 150`).
  - `CHART_PLOT_MARGIN`: Standard cartesian plot margins `{ top: 4, right: 4, bottom: 0, left: 0 }`.
  - `CHART_PLOT_MARGIN_BARE`: Minimal plot margins `{ top: 2, right: 2, bottom: 2, left: 2 }`.
- **Types**:
  - `ChartTypeFace`: `"axis" | "legend" | "tooltipTitle" | "tooltipBody"`.
- **Functions**:
  - `chartFontSize(face: ChartTypeFace): number`: Returns numeric font size token for given face.
  - `chartTextStyle(face: ChartTypeFace): { fontSize: number }`: Typography style helper.
  - `chartTickStyle(face: ChartTypeFace = "axis"): { fontSize: number, fill: string }`: Axis tick style helper.
  - `getChartColor(index: number): string`: Modular color retrieval from `CHART_COLORS` palette (`CHART_COLORS[index % length]`).
  - `seriesColor(series: ChartSeriesDescriptor | undefined, index: number): string | undefined`: Resolves color by returning explicit `series.color` or palette fallback `CHART_COLORS[index % length]`. Note: returns `string | undefined` (does not guarantee chart-1 fallback; callers such as `ChartLegend` apply `--basalt-chart-1` fallback).
  - `chartTooltipContentStyle()`: Returns `{ background: "transparent", border: "none", borderRadius: "0", boxShadow: "none", fontSize: 12, color: string, padding: "0" }`.
  - `chartTooltipProps(options?: { formatter?: (value: number) => string; cursor?: "bar" | "line" | false })`: Assembles complete Recharts tooltip props with custom `ChartTooltipContent` element renderer.

<a id="chart-series"></a>
### Chart Series Utilities (`@nocoo/basalt/charts/series`)
Manages series descriptor shapes, point definitions, and data key fallbacks:
- **Types**:
  - `ChartSeriesDescriptor`: `{ key: string, label?: string, color?: string }`.
  - `XYSeriesDescriptor`: Restricts `key` to `XYSeriesKey` (`"y" | "y2" | "y3"`).
  - `BulletSeriesDescriptor`: Restricts `key` to `BulletSeriesKey` (`"value" | "target"`).
  - Point types with concrete field shapes:
    - `XYPoint`: `{ x: string | number; y: number; y2?: number; y3?: number }`.
    - `NamedValue`: `{ name: string; value: number }`.
    - `RadarPoint`: `{ subject: string; value: number }`.
    - `BulletPoint`: `{ name: string; value: number; target: number }`.
    - `SankeyData`: `{ nodes: { name: string }[]; links: { source: number; target: number; value: number }[] }`.
- **Functions**:
  - `resolveChartSeries(series: ChartSeriesDescriptor[] | undefined, fallbackKeys: string[]): ChartSeriesDescriptor[]`: Normalizes user-supplied series or maps `fallbackKeys` to descriptors `{ key }`. Current chart APIs use fixed XY/value keys; dynamic series expansion is scheduled for P5.
  - `applyLeadColor(items: ChartSeriesDescriptor[], color?: string): ChartSeriesDescriptor[]`: If `color` is provided and the first item does not specify a `color` (`item.color ?? color`), sets the first item's color. Preserves an explicit first-item color.
  - `xyFallbackKeys(data: Array<{ y2?: number; y3?: number }>): string[]`: Scans data array and dynamically includes `"y2"` and `"y3"` if present, returning `["y", ...]` keys.

