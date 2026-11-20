# 06 · Route Surfaces, Visual Harness & Design Sync

Companion reference to [AGENTS.md](../AGENTS.md) and [DESIGN.md](../DESIGN.md) covering Basalt's runtime route surfaces, standalone template isolation, `/dev/examples` visual regression harness, and cross-file maintenance contract.

## 1. Route Surfaces

### Public catalog showcase

- Routes inside `DashboardLayout` (`/dashboard`, `/components`, `/layout`, `/palette`, `/templates`, `/ui/*`) are visitor-facing pages listed in navigation, `SHOWCASE_PAGES`, and `sitemap.xml`.
- Every catalog route under `DashboardLayout` uses app-local `ShowcasePage`, including all category overviews, documentation pages, and source viewers. `ContentIsland` owns the page inset; card slots own their padding (see [DESIGN.md#page-composition](../DESIGN.md#page-composition)).
- `/dashboard` (`src/pages/DashboardPage.tsx`) verifies multi-card analytics/chart grids and `@[...]/island` container responsiveness inside the full app shell.
- `/components`, `/layout`, and `/palette` host `MicroSceneWall`, `SurfaceDisciplineInspector`, and `ThemeStudio`.

### Standalone templates

- Reference screens in `src/templates/*.tsx` render outside `DashboardLayout` at `/view/:slug` (`src/pages/TemplateViewportPage.tsx`) with `applyToDocument={false}` in `src/App.tsx`, synced from `/templates` via same-origin `postMessage`.
- Templates are copyable `"use client";` modules that must import only public `@nocoo/basalt/*` entrypoints and use classes shipped in `@nocoo/basalt/styles/standalone` (no catalog-private `@/` imports).
- Enforced by `bun run design:check`, `src/test/pages/TemplateStyles.test.ts`, and `bun run consumer:next`.

### Developer visual harness (`/dev/examples`)

- `src/pages/DevExamplesPage.tsx` provides a shell-free internal regression canvas outside `DashboardLayout`.
- Registered in `STANDALONE_EXAMPLE_PATHS` (`src/lib/routes.ts`) so the Cloudflare Worker serves HTTP 200 while keeping `/dev/examples` out of visitor navigation and `sitemap.xml`.
- Query parameters and inspection hooks:
  - `?theme=light|dark`: non-persisting theme override (`ThemeProvider persist={false}` + `applyToDocument={false}`), leaving host `localStorage` untouched.
  - `?q=controls,data,overlay,micro-scenes,surface-inspector,templates`: comma-separated panel slicing.
  - `?hover=<selector>`: frozen `:hover` inspection cloned to `.__basalt_hover` with transitions disabled.
  - Per-panel `PanelBoundary` reporting exposes `window.__basaltExamplesDone` and `window.__basaltFailures`.

## 2. AI Verification & Maintenance Workflow

- Use `/dev/examples` (`?theme=`, `?q=`, `?hover=`) for fast, isolated primitive, token, and hover checks without mutating `localStorage` or loading heavy chart shells like `/dashboard`.
- Use `/dashboard` and `/templates` to verify full-shell layout, container queries, and iframe isolation.
- Whenever adding or modifying core primitives, surface contracts, or templates, keep these files synchronized in the same change:
  1. `src/pages/DevExamplesPage.tsx` panels
  2. `TEMPLATE_MANIFEST` in `src/models/template-manifest.ts`
  3. `src/lib/routes.ts` (for any new `<Route>` path so the Worker returns the app shell instead of `dist/404.html`)
  4. Byte-identical `DESIGN.md` and `packages/basalt/ai/DESIGN.md`

## 3. Design Contract Quick Reference

Canonical specifications live in [DESIGN.md](../DESIGN.md). Key non-negotiable rules enforced by `bun run design:check` (pre-push and CI `L4`; unit tests exercise isolated rule fixtures):

- **Role-based spacing ([DESIGN.md#spacing](../DESIGN.md#spacing)):** compact controls keep 2/4/6/8px; cards and layouts select 12/16/24/32px (`sm`/`md`/`lg`/`xl`, expressed in `rem`). Cards/grids default to 16px and page sections to 24px. Never enlarge shared control tokens to fix a container.
- **Container boundary ownership ([DESIGN.md#container-boundary-ownership](../DESIGN.md#container-boundary-ownership)):** full-width disclosures use `LayerCard.Header asChild` on `CollapsibleTrigger`, expanded fields use `LayerCard.Body` inside `CollapsibleContent unstyled`, and attached code (`CodeBlock attached` / `CodeHighlighted attached`) owns its inset. No native dashboard `<details>`/`<summary>`, painted/inset-free bars, `p-0` slot repairs, or code-frame CSS patches.
- **Selection and navigation hierarchy ([DESIGN.md#selection-and-navigation-hierarchy](../DESIGN.md#selection-and-navigation-hierarchy)):** neutral selection uses brighter `--basalt-selected` / `--basalt-selected-foreground` tokens and readable labels without decorative side bars or frames, distinct from hover, focus, and disabled states. Never use decorative accent or muted fills for selection. Sidebar group labels are uppercase disclosures, not destination rows.
