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
In `v2.0.3`, wildcard exports (`./components/*`, `./charts/*`, `./providers/*`) exposed all non-test modules in the package, including internal building blocks (e.g., `components/typeahead-field`, `components/overlay`, `charts/sample`).

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
