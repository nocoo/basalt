# Changelog

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
