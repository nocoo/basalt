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
- **Included on root:** `Button`, `Input`, `Checkbox`, `Switch`, `Badge`, `Text`, `Label`, `Separator`, `LayerCard`, `DescriptionList`, `Sidebar`, `Dialog`, `Sheet`, `Popover`, `Tooltip`, `Toast`, `ThemeProvider`, `ThemeToggle`, `LinkProvider`.
- **Excluded from root:**
  - Radio inputs (`@nocoo/basalt/components/radio`)
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
3. **Form Contract & Known Limitations:** Standard inputs (`Input`, `InputArea`, `Checkbox`, `Radio`, `Switch`) participate in `FormData` extraction. Native reset, external form association, readOnly validation suppression, and required validation boundaries are fully integrated for `DatePicker`, with forwarded refs properly targeting the underlying native input and errors surfaced on the visible trigger. `Autocomplete` unselected free-text and label matching blur commit preserves natural focus traversal without reclaiming focus.
4. **Accessibility Contract:** Components follow WAI-ARIA authoring practices. Semantic roles and `aria-*` attributes are maintained. Focus traps and keyboard navigations are incrementally hardened across component milestones.
5. **Reduced Motion:** Components with motion support respect `@media (prefers-reduced-motion: reduce)`. Streaming carets, loaders, skeleton shimmer, badges, meters, selection indicators, and chart marks are covered by the motion regression gates. Static charts use the shared zero-animation configuration, including Gauge.

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
  - `chartTooltipProps(options?: { formatter?: (value: number) => string; cursor?: "bar" | "line" | false; customTooltip?: (props: { active?: boolean; payload?: readonly ChartTooltipItem[]; label?: string | number }) => ReactNode })`: Assembles complete Recharts tooltip props with custom `ChartTooltipContent` element renderer or caller-provided `customTooltip` callback.

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
  - `resolveChartSeries(series: ChartSeriesDescriptor[] | undefined, fallbackKeys: string[]): ChartSeriesDescriptor[]`: Normalizes user-supplied series or maps `fallbackKeys` to descriptors `{ key }`. Supports generic type-safe series descriptors with dynamic numeric data keys. Arbitrary keys require explicit series; omitted or empty series retain each chart's legacy `y`, `y2`, and `y3` series fallback. Note that TypeScript type inference does not automatically enumerate object keys at runtime.
  - `applyLeadColor(items: ChartSeriesDescriptor[], color?: string): ChartSeriesDescriptor[]`: If `color` is provided and the first item does not specify a `color` (`item.color ?? color`), sets the first item's color. Preserves an explicit first-item color.
  - `xyFallbackKeys(data: Array<{ y2?: number; y3?: number }>): string[]`: Scans data array and dynamically includes `"y2"` and `"y3"` if present, returning `["y", ...]` keys. Compatible with legacy XY series fallback.


---

<a id="6-unreleased-migration-notes-p1p10"></a>
## 6. v2.1.0 migration notes (P1–P10)

These notes cover the components, documentation, examples and palette changes included in **v2.1.0**. The original v2.0.3 110-entrypoint / 572-symbol baseline remains byte-for-byte frozen. New entries are recorded in the current registry rather than rewriting that historical baseline.

### Palettes and production URL

| Before | Current behavior | Consumer action |
|---|---|---|
| 24 control accents sharing chart tokens | 12 iMac / iPhone 5C-inspired accents on `--basalt-accent-1…12` | Build pickers from `useAccent().swatches`; do not assume the former count, order, labels, or token values. |
| 24 distinct `CHART_COLORS` entries | Fixed five-color Blue / Pink / Green / Yellow / Gray cycle; the first four match classic control swatches exactly | Replace direct indexing beyond 4 with `getChartColor(index)` or `index % CHART_COLORS.length`. This is an intentional visual and runtime-value change, not a claim that all prior palette behavior is unchanged. |
| Numbered chart tokens and 24 `chart` keys | Existing names retained as aliases of five chart colors | Keep imports; expect repeated colors. Use explicit per-series colors and descriptive legends where five categories are insufficient. |
| Presets only | Optional `AccentProvider.paletteOverrides` with light/dark HSL pairs | Application owns validation and persistence. Overrides affect control swatches and semantic primary, never chart tokens. |
| Ring remainder tied to a series color | Theme-aware neutral `chartMuted` track | No prop migration. Gauge is static under reduced motion and displays 0, partial, and full values without a black remainder. |
| `https://basalt.hexly.ai` | `https://basaltui.com` | Update bookmarks and production links. Browser storage is origin-scoped, so old-domain theme/palette preferences cannot transfer automatically. Local `basalt.dev.hexly.ai` is unchanged. |

Chart gray retains its prior light/dark values. Marks use solid candy colors without contrasting outlines or shadows; their fills are not darkened. Raw candy fills can fall below 3:1 on light surfaces; use descriptive labels and `summary` / `dataAlternative` alongside them. Custom control palettes remain independent.

v2.1.0 includes the palette count and value changes above as an explicit exception to the usual minor-release compatibility policy. Consumers that index colors or persist palette choices must follow these migration notes. The unchanged export baseline alone does not prove runtime-value compatibility.

Persisted accent IDs are normalized on reads and selections:

| Old ID | Retained ID |
|---|---|
| `jade`, `seafoam` | `teal` |
| `vermilion`, `crimson` | `red` |
| `magenta` | `rose` |
| `orchid` | `purple` |
| `cobalt` | `indigo` |
| `steel` | `primary` |
| `cadet` | `sky` |
| `olive` | `lime` |
| `gold` | `amber` |
| `tangerine` | `orange` |

Other retained IDs keep their identity with the new palette values. Unknown IDs fall back to `primary`. Use IDs rather than array positions for saved selections.

### Components and application recipes

| Area | Additions and compatibility | Application responsibility |
|---|---|---|
| Resource screens | Additive DataTable sorting, manual processing/pagination, header and retry options; ResourceList state/toolbar/bulk/footer slots; granular BatteryMeter | Queries, authorization, selection policy, total counts and backend requests |
| Filtering | MultiSelect, FilterBar and FilterChip, including controlled search and native form/reset support | Search results and business filter state |
| Uploads | FileDropzone plus UploadQueue/UploadItem, validation, progress and action callbacks | Transport, retry/cancel, object URL lifetime and server validation |
| Editing and navigation | InlineEditable, EditableNavItem/FolderNavItem, IconPicker, TagBadge/TagColorPicker, ResponsiveMasterDetail | Persistence, routing, allowed icons, stable item IDs and tree policy |
| App templates | Complete AppFrame, Login and Resources modules in `ai/RECIPES.md`, compiled from the installed package | Router adapters, authentication, permissions, API calls and real data |
| Chart details | Values heatmap and Timeline rails use fixed chart tokens; optional `TimelineEvent.textColor` pairs custom event backgrounds with readable titles and subtitles | Choose text color for custom backgrounds; omitted `textColor` keeps the legacy white treatment for explicit event colors |
| Documentation | Generated props retain generics, callback/constructor union precedence, readonly arrays and tuples | Use the declared type parameters; generated text no longer substitutes `unknown` for caller data types |

New workflow modules stay on granular subpaths. Existing string table headers, legacy chart `y`/`y2`/`y3` inputs, required ResourceList data, and explicit series colors remain supported. No automatic downstream migration is performed. A full tree adapter, draggable SplitPane, and maps remain outside this release scope.
