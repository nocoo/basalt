# Changelog

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
