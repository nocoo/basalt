# 08 · Overhaul Changes & Migration Guide (Phases 0–4)

This guide summarizes all visual, structural, library API, and showcase changes applied since `v3.5.2` (`98d8308b` through `655947c2`). Released in `v3.6.0`.

---

## Phase 0 · Core Bug Fixes & Dead-Token Cleanup

- **Content island & scroll container isolation (`138f41e7`, `d882a5cc`)**: Isolated `app-main` background/corners to prevent `ContentIsland` corner leakage, added `color-scheme` and scrollbar styling, and disabled ligatures (`font-variant-ligatures: none`) in code panels.
- **Hover, focus & class-merge fixes (`cd7c5fa2`, `f01d0baf`, `085dc525`)**: Aligned list-local hover geometry and pulse tokens, prevented `cn` (`tailwind-merge`) from stripping `shadow-basalt-*` tokens, removed redundant `shadow-xs` on control surfaces, fixed `PageHeader` prop cleanup and `CommandEmpty` class merging, and aligned `LayerCard` radius tokens.
- **Palette, viewmodels & pagination cleanup (`ed2aadf5`, `fa42b27d`, `2286a357`, `a868b100`)**: Aligned chart hue names, returned semantic trend directions from stats viewmodels, aligned `NavigationPage` pagination examples with `TablePager`, and removed dead CSS tokens and unused chart files.

## Phase 1 · Matte Surface Ladder, Contrast, Selection & Elevation

- **Rebuilt L0–L3 island surface ladder (`904932cb`)**: Tuned light and dark matte neutral steps (`L0` shell -> `L1` island -> `L2` card -> `L3` raised/control well) to increase edge legibility without turning broad backgrounds muddy gray.
- **Neutral hover & smoked selection (`d0af6857`)**: Unified hover layers and active selection surfaces (smoked neutral tint with hairline border in light mode, raised neutral in dark mode; no accent fills or decorative bars).
- **Blur-free scrims, elevation tokens & edge-lit controls (`32b266a4`, `0367fbff`, `c9ef073c`, `37c3bb1a`)**: Removed backdrop-blur scrims in favor of matte scrim tokens, added dedicated elevation and floating-surface tokens (`shadow-basalt-floating`, rim highlights), introduced edge-lit button rims, and saturated dark-mode `--basalt-primary` and link tokens.

## Phase 2 · Typography, Icons, Status Tones & Refined Controls

- **Typography & self-hosted fonts (`94135aab`, `01410848`)**: Added `@nocoo/basalt/fonts.css` shipping self-hosted `Inter` and `JetBrains Mono` `@font-face` rules, aligned font weights and scale roles, and reset `sm` and `md` tracking (`letter-spacing`) to `0`.
- **Unified icon stroke & status tone system (`94135aab`, `9df99c5e`)**: Standardized stroke width across Lucide icons and introduced the 5-tone semantic system (`neutral | info | success | warning | danger`) across `Badge`, `Banner`, `toast`, `Meter`, and `Progress`.
- **Refined control & table states (`14ccd767`)**: Tightened interactive control geometry (`Switch` compacted to `h-basalt-4_5 w-basalt-8`), refined `Accordion` focus/border alignment, and unified `Table` hover/selected/head row states.

## Phase 3 · Library Expansion, API Normalization & Legacy Alias Removal

- **New public primitives (`eb0e31f8`)**: Added `@nocoo/basalt/components/spinner`, `@nocoo/basalt/components/kbd`, `@nocoo/basalt/components/progress`, `@nocoo/basalt/components/pagination`, and `@nocoo/basalt/components/combobox` (all re-exported from the root `@nocoo/basalt` barrel).
- **Upgraded containers, menus, charts & triggers (`8b6e4eb6`, `869187a4`)**:
  - Added typed responsive column/span helpers (`GridColumnCount`, `ResponsiveGridColumns`, `GridSpan`, `ResponsiveGridSpan`, `GridItemProps`) to `Grid`.
  - Upgraded `ChartFrame` with `CHART_FRAME_SIZES` / `ChartFrameSize` and `ChartTooltip` / `ChartTooltipProps`.
  - Expanded `DropdownMenu` and `ContextMenu` with full group/portal/sub/radio/checkbox/label/separator/shortcut composition (and exported the `DropdownMenu*` suite from root).
  - Replaced `InputArea` with `Textarea` and `SkeletonLine` with `Skeleton`, upgraded `LayerCard` (`LayerCardTitleProps`, `LayerCardDescriptionProps`), and aligned picker triggers (`Select`, `Combobox`, `DatePicker`, `Autocomplete`, `MultiSelect`).
- **Normalized sizes, refs, uncontrolled state & removed aliases (`440bb79b`)**:
  - Standardized `"default"` / `"base"` size variants to `"md"` across `Checkbox`, `Radio`, `Input`, `Select`, `SensitiveInput`, `Switch`, `Avatar`, `Toggle`, `Banner`, `Dialog`, `AlertDialog`, and `Empty`.
  - Added `forwardRef` and consistent controlled/uncontrolled props (`defaultValue` / `defaultPage`) across form and navigation primitives.
  - Verified public API surface (`packages/basalt/public-api-baseline.json`): **98 paths / 545 symbols** (`ai/registry.json`: **108 modules / 717 symbols / 81 ready catalog entries**).

## Phase 4 · Showcase Slimming, IA Refactor, MVVM & Visual Polish

- **English-only catalog & MVVM shell navigation (`8a0a7d66`)**: Removed `i18n` locales and the header `EN / 中文` switcher, consolidated navigation into [`src/models/navigation.ts`](../src/models/navigation.ts) + [`src/viewmodels/useShellNavigationViewModel.ts`](../src/viewmodels/useShellNavigationViewModel.ts), streamlined the sidebar to 3 groups (`OVERVIEW`, `SCENARIOS`, `PAGES`), removed 5 redundant showcase pages, fixed mobile breadcrumb horizontal overflow inside `AppHeader`, and added `SidebarGroup` sibling `action` slot support.
- **Removed legacy shadcn CSS alias layer (`fa0b03db`)**: Deleted `@theme inline`, legacy `:root`/`.dark` shadcn aliases, and `@utility font-display` from [`src/index.css`](../src/index.css); standardized showcase card headings via `LayerCard.Title` in `SettingsPage.tsx`.
- **Component docs, code blocks, gallery & copy polish (`655947c2`)**: Renamed `UiPlaceholderPage` to [`ComponentDocPage`](../src/pages/ui/ComponentDocPage.tsx), removed the dead placeholder branch and `"Page status"` filter, unified the sticky desktop `ON THIS PAGE` TOC across all 81 component pages, updated [`CodeBlock`](../packages/basalt/src/components/code.tsx) headers (`font-basalt-sans` titles, right-aligned copy bar without fake `"Code"` label when omitted), removed `"Code example"` doc headers, enriched `/ui` previews for `badge`, `kbd`, `progress`, and `spinner`, removed `"Simulate a failed submission"` from `DemoFeedback`, and replaced placeholder copy in dashboard metric cards, category overviews, `overlay` examples, and Landing `Templates` links (`/templates`).

---

## Downstream Migration Quick Reference

| Area                             | Before (`v3.5.2`)                                                                                                                               | After (Phases 0–4)                                                                                             | Action Required                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Badge` API                      | `variant="default" \| "secondary" \| "destructive" \| "outline"`                                                                                | `tone?: "neutral" \| "info" \| "success" \| "warning" \| "danger"`, `variant?: "soft" \| "solid" \| "outline"` | Replace semantic `variant` with `tone`; use `"soft"` / `"solid"` / `"outline"` for `variant`. |
| `Banner` API                     | `variant`, `size="base"`                                                                                                                        | `tone?: "neutral" \| "info" \| "success" \| "warning" \| "danger"`, `size="sm" \| "md"`                        | Rename `variant` prop to `tone`; replace `size="base"` with `"md"`.                           |
| `Toast` API                      | `ToastVariant`, `options.variant`, `<Toast>` export                                                                                             | `ToastTone`, `options.tone`; `<Toast>` removed                                                                 | Rename `ToastVariant` / `variant` to `ToastTone` / `tone`; import `toast` + `Toaster`.        |
| Size Tokens (`sm` / `md` / `lg`) | `size="default"` or `"base"` on `Input`, `Select`, `SensitiveInput`, `Switch`, `Checkbox`, `Radio`, `Avatar`, `Toggle`, `Dialog`, `AlertDialog` | `size="md"`                                                                                                    | Replace `"default"` / `"base"` size literals with `"md"`.                                     |
| `Textarea` & `Skeleton`          | `@nocoo/basalt/components/input-area` (`InputArea`), `.../skeleton-line` (`SkeletonLine`)                                                       | `@nocoo/basalt/components/textarea` (`Textarea`), `.../skeleton` (`Skeleton`)                                  | Update import paths and component names.                                                      |
| `StatStrip`                      | `@nocoo/basalt/components/stat-strip` (`StatStrip`)                                                                                             | `StatCard` + `StatGrid` (`@nocoo/basalt/components/stat-card` or root)                                         | Replace `StatStrip` compositions with `StatGrid` + `StatCard`.                                |
| `ChartShell`                     | `ChartShell`, `ChartShellProps`                                                                                                                 | `ChartFrame`, `ChartFrameProps` (`@nocoo/basalt/components/chart`)                                             | Replace `ChartShell` imports with `ChartFrame`.                                               |
| `ContextMenuPanel`               | `ContextMenuPanel` export                                                                                                                       | `ContextMenuContent` (`@nocoo/basalt/components/context-menu`)                                                 | Use `ContextMenuContent`.                                                                     |
| Internal Overlay Helpers         | `@nocoo/basalt/components/overlay` (`overlayPanelClass`, etc.)                                                                                  | Package-internal utilities                                                                                     | Remove direct imports from `/components/overlay`.                                             |
| Typography Setup                 | Host app loads Google Fonts or fallback sans/mono                                                                                               | Optional `@nocoo/basalt/fonts.css`                                                                             | Import `@nocoo/basalt/fonts.css` if self-hosted `Inter` & `JetBrains Mono` are desired.       |
| CodeBlock Omitted Title          | Rendered `"Code"` text + file icon in header                                                                                                    | Right-aligned copy bar only (`aria-label="Code"` on `<pre>`)                                                   | Pass explicit `title` when a filename header is desired.                                      |
