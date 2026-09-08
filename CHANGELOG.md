# Changelog

## [Unreleased]

### Added
- Library showcase pages for loading skeletons (`/loading-states`), motion (`/animation`) and dense tables (`/tables`).

### Changed
- Replace the obsidian corner-tower mark with the Hanbaiyu marble and candy-color presentation; navigation, favicons and the embedded library mark stay transparent, while README and social images keep the pale engineering field.

### Fixed
- Align the collapsed sidebar search control with the icon rail size, centering and spacing.
- Stop nested full-viewport sidebar columns from leaking wheel scroll into the document and opening blank space below the shell.

## [2.1.0] - 2026-09-07

### Added
- Source-backed package registry, installed source recovery, compilable documentation and AppFrame / Login / Resources recipes.
- Complex loading dashboard, resource-list and detail compositions; interactive device and subscription tables with formatted cells, inline charts and BatteryMeter.
- MultiSelect, FilterBar/FilterChip, FileDropzone and UploadQueue/UploadItem.
- InlineEditable, EditableNavItem/FolderNavItem, IconPicker, TagBadge/TagColorPicker and ResponsiveMasterDetail.
- Dynamic typed chart series, accessible summaries/data alternatives, tooltip compositions and HeatmapMatrix.
- Palette editor with twelve light/dark custom pairs, localStorage persistence, cross-tab sync, validation and restoration.
- CI package/consumer/showcase gates, failure propagation checks and release validation tied to the exact commit.

### Changed
- Replace the 24-color control palette with twelve candy colors inspired by classic Apple iMac and iPhone 5C finishes; raw swatches and contrast-safe primary tokens are distinct.
- Charts now use a fixed five-color cycle. Blue, pink, green and yellow match the classic control swatches exactly; the existing gray is retained, and chart marks use solid colors without contrasting outlines or shadows. `CHART_COLORS.length` changes from 24 to 5; use `getChartColor(index)` or modulo indexing. Old `chart` keys and numbered CSS tokens remain aliases. [Migration details](https://github.com/nocoo/basalt/blob/v2.1.0/packages/basalt/ai/COMPATIBILITY.md#6-unreleased-migration-notes-p1p10) list stored-ID mappings and runtime-value changes.
- Add optional `AccentProvider.paletteOverrides`; consumer applications own persistence.
- Set the production URL and GitHub homepage to https://basaltui.com. Browser preferences on the previous origin do not migrate automatically.
- Adopt the corner-tower brand across navigation, login, loading marks, browser icons and social previews; the package embeds its mark without requiring a public asset path.
- Restore the browser title to `basalt.`.
- Complete example forms, settings, data filtering and chat workflows, including failure/retry and responsive navigation.
- Update Playwright, Lucide, SWC, Node types and consumer fixtures, including Next.js 16.3.4 and React Table 9.2.4.

### Fixed
- Native forms/reset and forwarded refs, portal clipping/forceMount/asChild, keyboard/focus restoration, Dock semantics and Slider contracts.
- Standalone CSS scope and class extraction, semantic contrast and reduced-motion behavior.
- Named Teal and Purple badges use the candy control swatches with readable text in both themes.
- Mobile documentation overflow/duplicate IDs, example chart sizing and Network SVG geometry.
- SectionRule wraps wide action groups on narrow screens, including the Health dashboard date controls.
- Gauge remainder uses a neutral theme track and the shared static animation setting.
- Generated API text retains generic context, readonly types and correct function/constructor union parentheses.
- Selection indicator default callbacks remain stable after Next.js production minification.
- Release automation synchronizes the lockfile and promotes curated Unreleased notes into the versioned changelog and GitHub release.
- Catalog tests reuse isolated copies of read-only registry results and scope DOM queries; full repository scans have explicit bounded timeouts on CI.

## [2.0.3] - 2026-09-04

### Added
- Demo overlay dock on chat page
- Normalize fab and dock catalog
- Add overlay mode to dock
- Add chat layout page
- Catalog chat family
- Add chat bubble composer header inbox
- Add fab and dock components
- Add capital unit editor dialog
- Add money-flow dialog demos
- Add mountain mark favicon
- Add library dialogs demo page
- Move controls into library nav
- Restack sidebar system pages
- Remove library placeholder docs

### Fixed
- Honor visibility overrides in dock trap
- Skip css-hidden dock trap ancestors
- Skip hidden nodes in dock trap
- Honor nested dialogs in dock trap
- Narrow overlay dock focus trap
- Keep overlay dock closed by default
- Copy inbox onSelect in catalog
- Trap overlay dock keyboard
- Ship chat utilities in standalone css
- Tighten chat kit public contracts
- Reset composer height and stop control
- Restore focus when dock toggles
- Pad chat composer bottom
- Tighten dialog panel padding
- Add interaction showcase chrome
- Add palette page chrome

## [2.0.2] - 2026-09-03

### Added
- Add section-rule page chrome
- Enrich chart catalog mock data
- Teach nested surfaces on layout
- Restyle data page nested surfaces
- Add description list component
- Nest layercard surfaces with well
- Add nested surface css engine

### Changed
- Spell out mvp chrome setup
- Document page chrome in integration
- Reuse page chrome sitewide
- Document nested surface recipe
- Amend luminance contract for l3 wells
- Add changelog and npm ignore-scripts
- Stop hardcoding version in 01
- Stop pointing release at unverified tags
- Sync 01 version with package.json
- Add claude agent handbook
- Add Retrospective.md for accident routing

### Fixed
- Collapse catalog index filters
- Flatten content page headers
- Wrap description list values
- Paint settings controls from surface
- Parse empty jsx attrs in standalone css
- Paint alert dialog as surface root
- Paint tables and controls from surface

## [2.0.1] - 2026-09-03

### Added
- Add automated release script
- Read app version from package.json
- Share theme palette with header picker

### Changed
- Rename chrome guide to integration
- Add app chrome guide for agents

### Fixed
- Date changelog entries in local timezone
- Stop ci catalog test timeouts

## [2.0.0] - 2026-09-03

First stable 2.0. Includes rc.1–rc.3.

### Added

- Publishable `@nocoo/basalt` package with granular ESM exports, Tailwind v4
  and standalone CSS, and consumer tarball gates.
- Shared `ChartLegend` and a custom chart tooltip (swatch, muted label,
  tabular value, popover chrome).
- Accent swatches (`AccentProvider`) with a showcase header picker persisted
  to `localStorage`.

### Changed

- Showcase login is the badge card only.
- LoadingScreen is a small mark and shimmer bar.
- Chart cards are one L2 surface; cartesian plots use compact margins.
- Demo pages consume library Table, Button, Link, SensitiveInput, and
  InputArea.

### Fixed

- Money and percent examples use integer series, named labels, and formatted
  tooltip/axis values instead of raw `y` keys.
- Legend markers follow the lead `color` prop and stay inside chart height.
- Heatmap and metric cards no longer wrap plots in a second border.

## [2.0.0-rc.3] - 2026-09-02

### Added

- Shared `ChartLegend` below cartesian and donut plots (`showLegend`).

### Changed

- Showcase chart cards are one L2 surface; `/components` no longer nests
  those cards in a second section card.

### Fixed

- Bar/line metric cards no longer wrap the plot in an inner border.
- Legend markers follow the lead `color` prop, and stay inside the chart
  height.

## [2.0.0-rc.2] - 2026-09-02

### Added

- Accent swatches (`AccentProvider`) that restyle `--basalt-primary`,
  `--basalt-ring`, and `--basalt-chart-1`, with a header picker on the
  showcase that persists the choice.

### Changed

- Showcase login is the badge card only; `/badge-login` is gone.
- LoadingScreen is a small mark and shimmer bar.
- Cartesian charts use compact plot margins and quieter tooltips.
- Demo pages consume library Table, Button, Link, SensitiveInput, and
  InputArea instead of leftover local copies.

### Fixed

- HeatmapCard no longer draws a second card inside the page surface.

## [2.0.0-rc.1] - 2026-09-02

### Added

- First publishable `@nocoo/basalt` package: ESM granular exports, Tailwind v4
  and standalone CSS, consumer tarball gates.
- Form, selection, overlay, navigation, and data/content MVPs (Table,
  DataTable, Pagination, TOC, Code, Flow, Grid) with generated catalog API
  and source-backed examples.

### Changed

- Site and package versions now share root `package.json` as the source of
  truth. Sidebar badge and `/api/live` read that value.

## [1.3.5] - 2026-07-29

### Fixed

- **Security**: Release the `postcss` root override (`8.5.22`) that
  closes GHSA-r28c-9q8g-f849 (high, path traversal in source-map
  auto-loading). `vitest@4.1.10` was pulling `vite@8.1.3` →
  `postcss@8.5.16` alongside the direct `postcss@8.5.22`; the override
  consolidates every resolution to `8.5.22`. Direct `postcss` pin and
  `vite` (already on `postcss@8.5.19`) unchanged. Closes basalt#291.

## [1.3.4] - 2026-07-21

### Changed

- **Dependencies**:
  - `@testing-library/jest-dom` ^6.9.1 → 7.0.0 (MAJOR). v7 requires
    `@testing-library/dom` as an explicit peer dependency and lifts the
    minimum Node.js version to 22 — both satisfied here (dom@10.4.1 was
    already resolved transitively via `@testing-library/react`; now
    pinned explicitly, Node 26 in use). No API/matcher removals.
  - `recharts` 3.9.2 → 3.10.0 (minor). Legend gains additive
    `position`/`offset` props; existing `align`/`verticalAlign` usage in
    `PieChartWidget` continues to work unchanged.
  Closes basalt#254, #255.

## [1.3.3] - 2026-07-20

### Changed

- **Dependencies (patch/minor bumps)**:
  - `postcss` 8.5.19 → 8.5.20
  - `@radix-ui/react-accordion` 1.2.16 → 1.2.17
  - `@radix-ui/react-alert-dialog` 1.1.19 → 1.1.20
  - `@radix-ui/react-avatar` 1.2.2 → 1.2.3
  - `@radix-ui/react-checkbox` 1.3.7 → 1.3.8
  - `@radix-ui/react-collapsible` 1.1.16 → 1.1.17
  - `@radix-ui/react-context-menu` 2.3.3 → 2.3.4
  - `@radix-ui/react-dialog` 1.1.19 → 1.1.20
  - `@radix-ui/react-dropdown-menu` 2.1.20 → 2.1.21
  - `@radix-ui/react-hover-card` 1.1.19 → 1.1.20
  - `@radix-ui/react-label` 2.1.11 → 2.1.12
  - `@radix-ui/react-menubar` 1.1.20 → 1.1.21
  - `@radix-ui/react-navigation-menu` 1.2.18 → 1.2.19
  - `@radix-ui/react-popover` 1.1.19 → 1.1.20
  - `@radix-ui/react-progress` 1.1.12 → 1.1.13
  - `@radix-ui/react-radio-group` 1.4.3 → 1.4.4
  - `@radix-ui/react-select` 2.3.3 → 2.3.4
  - `@radix-ui/react-separator` 1.1.11 → 1.1.12
  - `@radix-ui/react-slider` 1.4.3 → 1.4.4
  - `@radix-ui/react-switch` 1.3.3 → 1.3.4
  - `@radix-ui/react-tabs` 1.1.17 → 1.1.18
  - `@radix-ui/react-toast` 1.2.19 → 1.2.20
  - `@radix-ui/react-toggle` 1.1.14 → 1.1.15
  - `@radix-ui/react-toggle-group` 1.1.15 → 1.1.16
  - `@radix-ui/react-tooltip` 1.2.12 → 1.2.13
  Closes basalt#228, #229, #230, #231, #232, #233, #234, #235, #236, #237, #238, #239, #240, #241, #242, #243, #244, #245, #246, #247, #248, #249, #250, #251, #252.

## [1.3.2] - 2026-07-18

### Changed

- **Dependencies (minor bump)**:
  - `lucide-react` 1.24.0 → 1.25.0
  Closes basalt#226.

## [1.3.1] - 2026-07-17

### Changed

- **Dependencies (patch/minor bumps)**:
  - `@biomejs/biome` 2.5.3 → 2.5.4
  - `@tailwindcss/vite` 4.3.2 → 4.3.3
  - `tailwindcss` 4.3.2 → 4.3.3
  - `vite` 8.1.4 → 8.1.5
  Closes basalt#221, #222, #223, #224.

## [1.3.0] - 2026-07-16

### Fixed

- **Mobile drawer regression**: the route-change effect in `DashboardLayout`
  had an empty dependency array left over from a stale `eslint-disable`
  comment; the drawer no longer closed after navigating from within it.
  Restored `[location.pathname]` deps with a `biome-ignore` annotation.
- **Broken typecheck script**: `typecheck` used to run `tsc --noEmit`
  against the solution-style root `tsconfig.json` (`files: []`), which
  silently type-checked nothing. Now runs both `tsconfig.app.json` and
  `tsconfig.node.json` explicitly — future TS errors actually get caught.

### Removed

- All six remaining `eslint-disable` comments across `src/`
  (`react-hooks/set-state-in-effect`, `react-refresh/only-export-components`) —
  the migration commit had claimed to remove them but missed these six.
  Biome has no equivalent rules, so the comments were dead weight.

### Added

- Regression test `src/test/components/DashboardLayout.test.tsx` covering
  the mobile-drawer scroll lock + route-change close flow, so this
  particular regression cannot resurface silently.

### Changed

- `README.md`: tech-stack table now advertises Vite 8 / TypeScript 7
  (not the pre-migration 7 / 5.9), and the "Run tests" snippet uses
  `bun run test` instead of a bare `vitest run` that assumes vitest is
  on PATH.
- `CLAUDE.md`: release-checklist verification command switched to
  `bun run test`.
- `osv-scanner.toml`: dropped ignored-vuln entries that referenced the
  now-deleted ESLint toolchain.

## [1.2.1] - 2026-07-15

### Changed

- **Toolchain**: Replaced ESLint (with `typescript-eslint`) by [Biome](https://biomejs.dev) 2.5.3.
  Biome is now the single tool for lint + format + import sorting. `eslint.config.js` is deleted;
  `biome.json` at repo root holds all rules (preset `recommended` plus tightened
  `noUnusedImports`, `noUnusedVariables`, `noNonNullAssertion`, `useConst`, `noDangerouslySetInnerHtml`).
- **TypeScript**: Bumped `typescript` 6.0 → 7.0.2. Dropped `baseUrl` and `ignoreDeprecations: "6.0"`
  from `tsconfig*.json` (paths now stand alone — TS 7 removed `baseUrl`).
- **Husky hooks unchanged**: pre-commit still runs `typecheck && lint && test && gitleaks`;
  pre-push runs `build && test:coverage && lint && osv-scanner`. `lint-staged` now runs
  `biome check --error-on-warnings --no-errors-on-unmatched` over the staged JS/TS/JSON/CSS files.

### Removed

- `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`,
  `typescript-eslint`, `globals` — full ESLint toolchain and all inline `eslint-disable` comments.

### Fixed

- Refactor `document.getElementById("root")!` in `src/main.tsx` to a guarded lookup that throws
  a clear error if the mount point is missing (removes `noNonNullAssertion` violation).
- Added `<title>` inside the Google logo SVG in `BadgeLoginPage` for `noSvgWithoutTitle` a11y.
- Every raw `<button>` now carries an explicit `type` attribute (`useButtonType` a11y).
- Applied Biome import ordering and tab-indent formatting across the codebase.

## [1.1.1] - 2026-06-11

### Changed

- **Dependencies**: Bumped 46 dependencies across patch, minor, and MAJOR upgrades.
  - Radix UI suite: 24 packages bumped to latest patch/minor versions.
  - **MAJOR**: `lucide-react` 0.563 → 1.17 (Github icon extracted to local component, brand icons removed in v1).
  - **MAJOR**: `eslint-plugin-react-hooks` 5.2 → 7.1 (new `set-state-in-effect` rule).
  - **MAJOR**: `eslint` 9 → 10, `@eslint/js` 9 → 10.
  - **MAJOR**: `typescript` 5.9 → 6.0 (added `ignoreDeprecations: "6.0"` migration shim for `baseUrl`).
  - **MAJOR**: `i18next` 25 → 26, `react-i18next` 16 → 17 (configured together).
  - **MAJOR**: `sonner` 1.7 → 2.0, `tailwind-merge` 2.6 → 3.6, `jsdom` 28 → 29, `@types/node` 22 → 25, `globals` 15 → 17.
  - Patch: react/react-dom 19.2.6 → 19.2.7, vite 8.0.10 → 8.0.16, vitest 4.1.6 → 4.1.8, plus other minor/patch bumps.

### Added

- `src/components/icons/github.tsx` — local Github icon component using `createLucideIcon`, replacing the brand icon removed from lucide-react v1.

## [1.1.0] - 2026-05-01

### Changed

- Minor version bump to validate CI/CD pipeline.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-23

### Added

- **i18n**: Full internationalization support with English and Chinese translations
- **Language toggle**: Dropdown in header for switching between languages
- **Version badge**: Subtle version indicator in sidebar header
- **Version API**: `/api/live` dev-server endpoint returning app version and status
- **Version management**: Single source of truth from `package.json` via Vite `define`
- **CLAUDE.md**: Project conventions for versioning, releases, and changelog
- **Dashboard components**: 24 reusable visualization cards (trend lines, gauges, heatmaps, charts, etc.)
- **Scenario dashboards**: Wearable health, banking/wealth, and network ops demo pages
- **Interaction showcase**: Toast notifications, dialog patterns, and overlay demos
- **Accessibility**: WCAG 2.1 AA compliance — ARIA labels, landmarks, semantic tables, skip navigation
- **MVVM architecture**: Models, viewmodels, and pages with clean separation of concerns
- **Command palette**: `Cmd+K` search across all pages
- **Theme system**: Light/dark/system toggle with localStorage persistence
- **Color palette**: 24-color chart palette with showcase page
- **Badge login page**: Skeuomorphic ID badge design with Google auth
- **Static page template**: 3-tier luminance layout
- **Loading page**: Orbital ring animation
- **HeatmapCalendar**: GitHub-style contribution calendar component
- **SlotBarChart**: Time-slot bar chart for schedule visualizations
- **Comprehensive test suite**: 116 tests across models, viewmodels, and page smoke tests

### Changed

- Upgraded to React 19, Vite 7, Tailwind CSS 4, React Router 7, Recharts 3
- Migrated from npm to bun package manager
- Enabled TypeScript strict mode
- Consolidated sidebar navigation from 9 control items to 4
