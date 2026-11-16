# Basalt Public API and Compatibility Policy

## 3.0 migration

Loader now renders an inline span with an eight-cell perimeter grid, an optional shimmering label, and an elapsed timer shown after 5000ms. Use `showLabel={false} showElapsed={false}` for icon-only slots. `size` controls grid dimensions, not the entire row. SVG-specific attributes no longer apply; span attributes do. `animate`, `shimmer`, `showElapsed`, and `elapsedDelayMs` control presentation. Reduced motion stops both animations. The timer measures real elapsed time from mount, including time before it becomes visible, and is hidden from live announcements.

Component geometry and DOM styling are intentional major-version changes. Recheck custom selectors and visual snapshots against the current components rather than relying on former utility classes. Action rows are 34px; banners are 46px with 12px vertical and 16px horizontal insets. Compact control spacing remains separate from the 12/16/24/32px card and layout scale. ContentIsland owns page insets and card slots own card padding; remove duplicated wrapper padding rather than overriding shared control tokens.

IconPicker trigger names include the current value (`Folder icon: Folder`, then `Folder icon: Book`). Exact-name automation must follow that value; Field labels, validation and descriptions remain attached to the trigger. Standalone application recipes scope native-element resets with `basalt-ui` and explicitly focus mobile drawer openers before opening them. The catalog's visitor-badge login is an intentional layout exception, not a general application-shell template.

The initial **`2.0.3`** release established a historical 110-entrypoint / 572-symbol inventory. The 4.0 overhaul intentionally replaces that inventory with the live 95-path / 477-symbol baseline captured in `public-api-baseline.json`; the historical counts are context, not the artifact currently verified by the package checks.

This document defines the stability contracts, export architecture, and semantic versioning guarantees for `@nocoo/basalt`.

## 4.0 migration

- Basalt no longer owns Recharts chart implementations or a `recharts` peer. Compose application-owned Recharts, ECharts, or SVG inside `@nocoo/basalt/components/chart`; `StatCard` moved to `@nocoo/basalt/components/stat-card` and accepts `icon?: ReactNode`.
- Thirteen AI/chat widgets and eight zero-consumer/site-brand controls were removed. Migrate `BasaltMark`, `Combobox`, `Pagination`, `DeleteResource`, `BatteryMeter`, `Flow`, `MenuBar`, and `NavigationMenu` out of the package contract; `LoadingScreen` now renders only caller-supplied `mark` content.
- Install only `@nocoo/basalt`. Lucide ships as a dependency; import public icons from `@nocoo/basalt/icons`, and retained Radix passthroughs from `@nocoo/basalt/primitives/*`.
- Tailwind CSS v4 consumers use `@import "@nocoo/basalt/styles"; @import "tailwindcss";`; the package embeds its own `@source` scan. No app-relative package glob is required.

---

## 1. Compatibility Baseline

The historical **`2.0.3`** release (commit `e61efc1`) exposed 110 entrypoints and 572 symbols. The 4.0 public contract is captured separately in `packages/basalt/public-api-baseline.json` and currently verifies **95 entrypoints / 477 symbols**. The package manifest remains `3.4.2` until the authorized 4.0 release step.

- **CSS Export Contracts:** 3 export paths:
  - `@nocoo/basalt/styles` (Tailwind contract alias)
  - `@nocoo/basalt/styles/tailwind` (Tailwind token definition)
  - `@nocoo/basalt/styles/standalone` (Zero-dependency compiled tokens and utility CSS)

### Machine Verification

All 95 current entrypoints, their export targets, 3 CSS paths, and all 477 current symbols (with value/type fidelity) are cataloged in `packages/basalt/public-api-baseline.json` and verified via `packages/basalt/scripts/verify-public-api.ts`. The file protects the pending 4.0 contract, not the historical 2.0.3 inventory.

---

## 2. Export Architecture & Root vs. Granular Principles

### Root Barrel (`@nocoo/basalt`)

The root barrel is reserved for lightweight, frequently-used leaves, standard inputs, core surfaces, and global providers.

- **Included on root:** `Button`, `Input`, `Checkbox`, `Switch`, `Badge`, `Text`, `Label`, `Separator`, `LayerCard`, `DescriptionList`, `Sidebar`, `SidebarBrand`, `SidebarToggle`, `Dialog`, `Sheet`, `Popover`, `Tooltip`, `Toast`, `ThemeProvider`, `ThemeToggle`, `LinkProvider`.
- **Excluded from root:**
  - Radio inputs (`@nocoo/basalt/components/radio`)
  - Engine-agnostic chart chrome (`@nocoo/basalt/components/chart`)
  - Complex table implementations (`@nocoo/basalt/components/data-table`)
  - Calendar pickers with complex date logic (`@nocoo/basalt/components/date-picker`)
  - Application frame layout chrome (`@nocoo/basalt/components/app-shell`, `app-header`, `page-header`, `section-rule`)

### Wildcard Subpaths & Legacy Internal Helpers

<a id="wildcard-subpaths"></a>
In `v2.0.3`, wildcard exports (`./components/*` and `./providers/*`) exposed all non-test modules in the package, including internal building blocks:

- **`@nocoo/basalt/components/overlay`**: Internal class generators and styling constants for overlay menus and select (`overlayPanelClass`, `overlayItemClass`, `FOCUS_RING`, `FOCUS_BORDER`, `MENU_GAP`, `OVERLAY_GAP`, `OVERLAY_LAYER`, `OVERLAY_MOTION`).

**Policy:**

1. In accordance with zero-breaking-change guarantees, **no existing export path will be removed in 2.x**.
2. Internal modules are marked as `@internal` or `@legacy` in documentation and metadata.
3. Callers should import public controls via their designated official export paths.

---

## 3. Semantic Versioning Rules

Basalt strictly follows [SemVer 2.0.0](https://semver.org/):

| Change Level        | Permitted Changes                                                                                                                              | Examples                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **PATCH** (`2.0.x`) | Backward-compatible bug fixes, internal optimizations, visual refinements that do not alter layout bounding boxes or break existing snapshots. | Fixing event propagation in `Button`, correcting border contrast ratio, fixing broken types.               |
| **MINOR** (`2.x.0`) | Additive, backward-compatible features; new components, new optional props, new granular export paths.                                         | Adding a new `FilterBar` component, introducing an optional `variant` prop to `Badge`.                     |
| **MAJOR** (`3.0.0`) | Breaking changes to existing public component signatures, DOM/ARIA structures, or removal of deprecated export paths.                          | Renaming required props, removing legacy wildcard subpaths, updating peer dependency minimums to React 20. |

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

`@nocoo/basalt/components/chart` is engine-agnostic. It exports `ChartFrame`, `ChartShell`, tooltip presentation primitives, `ChartLegend`, palette tokens, `ChartSeriesDescriptor`, and numeric/color helpers. `ChartFrame` accepts `ReactNode`; responsive containers and visualization components remain application-owned. Recharts is not a Basalt peer dependency.

`@nocoo/basalt/components/stat-card` exports `StatCard` and `StatGrid`. Supporting charts compose inside `StatCard.children` without coupling the metric component to a chart engine.

---

<a id="6-unreleased-migration-notes-p1p10"></a>

## 6. v2.1.0 migration notes (P1–P10)

These notes cover the components, documentation, examples and palette changes included in **v2.1.0**. The 2.0.3 110-entrypoint / 572-symbol figures remain historical context; the live verifier protects the rewritten 4.0 contract.

### Palettes and production URL

| Before                                    | Current behavior                                                                                                  | Consumer action                                                                                                                                                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 24 control accents sharing chart tokens   | 12 iMac / iPhone 5C-inspired accents on `--basalt-accent-1…12`                                                    | Build pickers from `useAccent().swatches`; do not assume the former count, order, labels, or token values.                                                                                                       |
| 24 distinct `CHART_COLORS` entries        | Fixed five-color Blue / Pink / Green / Yellow / Gray cycle; the first four match classic control swatches exactly | Replace direct indexing beyond 4 with `getChartColor(index)` or `index % CHART_COLORS.length`. This is an intentional visual and runtime-value change, not a claim that all prior palette behavior is unchanged. |
| Numbered chart tokens and 24 `chart` keys | Existing names retained as aliases of five chart colors                                                           | Keep imports; expect repeated colors. Use explicit per-series colors and descriptive legends where five categories are insufficient.                                                                             |
| Presets only                              | Optional `AccentProvider.paletteOverrides` with light/dark HSL pairs                                              | Application owns validation and persistence. Overrides affect control swatches and semantic primary, never chart tokens.                                                                                         |
| Ring remainder tied to a series color     | Theme-aware neutral `chartMuted` track                                                                            | No prop migration. Gauge is static under reduced motion and displays 0, partial, and full values without a black remainder.                                                                                      |
| `https://basalt.hexly.ai`                 | `https://basaltui.com`                                                                                            | Update bookmarks and production links. Browser storage is origin-scoped, so old-domain theme/palette preferences cannot transfer automatically. Local `basalt.dev.hexly.ai` is unchanged.                        |

Chart gray retains its prior light/dark values. Marks use solid candy colors without contrasting outlines or shadows; their fills are not darkened. Raw candy fills can fall below 3:1 on light surfaces; use descriptive labels and `summary` / `dataAlternative` alongside them. Custom control palettes remain independent.

Named Teal and Purple `Badge` variants retain the Bondi and Grape identities with dedicated light/dark background tokens. Solid color badges (`success`, `red`, `orange`, `teal`, `blue`, `purple`) now use paired semantic foreground tokens, including dark text on brighter dark-theme fills. Do not force white text or substitute raw chart colors for those background/foreground pairs.

v2.1.0 includes the palette count and value changes above as an explicit exception to the usual minor-release compatibility policy. Consumers that index colors or persist palette choices must follow these migration notes. Export verification alone does not prove runtime-value compatibility.

Persisted accent IDs are normalized on reads and selections:

| Old ID                 | Retained ID |
| ---------------------- | ----------- |
| `jade`, `seafoam`      | `teal`      |
| `vermilion`, `crimson` | `red`       |
| `magenta`              | `rose`      |
| `orchid`               | `purple`    |
| `cobalt`               | `indigo`    |
| `steel`                | `primary`   |
| `cadet`                | `sky`       |
| `olive`                | `lime`      |
| `gold`                 | `amber`     |
| `tangerine`            | `orange`    |

Other retained IDs keep their identity with the new palette values. Unknown IDs fall back to `primary`. Use IDs rather than array positions for saved selections.

### Components and application recipes

| Area                   | Additions and compatibility                                                                                                                                    | Application responsibility                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Resource screens       | Additive DataTable sorting, manual processing/pagination, header and retry options; ResourceList state/toolbar/bulk/footer slots; granular Meter               | Queries, authorization, selection policy, total counts and backend requests                                              |
| Filtering              | MultiSelect, FilterBar and FilterChip, including controlled search and native form/reset support                                                               | Search results and business filter state                                                                                 |
| Uploads                | FileDropzone plus UploadQueue/UploadItem, validation, progress and action callbacks                                                                            | Transport, retry/cancel, object URL lifetime and server validation                                                       |
| Editing and navigation | InlineEditable, EditableNavItem/FolderNavItem, IconPicker, TagBadge/TagColorPicker, ResponsiveMasterDetail                                                     | Persistence, routing, allowed icons, stable item IDs and tree policy                                                     |
| App templates          | Complete AppFrame, Login and Resources modules in `ai/RECIPES.md`, compiled from the installed package                                                         | Router adapters, authentication, permissions, API calls and real data                                                    |
| Chart details          | Values heatmap and Timeline rails use fixed chart tokens; optional `TimelineEvent.textColor` pairs custom event backgrounds with readable titles and subtitles | Choose text color for custom backgrounds; omitted `textColor` keeps the legacy white treatment for explicit event colors |
| Documentation          | Generated props retain generics, callback/constructor union precedence, readonly arrays and tuples                                                             | Use the declared type parameters; generated text no longer substitutes `unknown` for caller data types                   |

New workflow modules stay on granular subpaths. Existing string table headers, legacy chart `y`/`y2`/`y3` inputs, required ResourceList data, and explicit series colors remain supported. No automatic downstream migration is performed. A full tree adapter, draggable SplitPane, and maps remain outside this release scope.
