# Basalt

Matte React design system and catalog at `https://basaltui.com`; npm package `@nocoo/basalt`.
Profile: ts-worker-web with a published component-library lane.
Direction: [INTEGRATION.md](INTEGRATION.md); numbered `docs/01`–`04` are historical plans and audits, not current API or quality truth. Frameworks must not rewrite this file.

## Scope and instruction sources

- This file is the only project handbook; nested files do not compete with it. Do not create a `CLAUDE.md` alias or copy.
- This file is the contract; hooks, CI and configuration enforce it. Raise weaker enforcement instead of lowering this contract.
- Human/API docs: [README.md](README.md), [INTEGRATION.md](INTEGRATION.md) and the [package README](packages/basalt/README.md). Version: root and `packages/basalt/package.json` must match; the site uses `src/lib/version.ts`. Enforcement: `.husky/`, CI/release workflows, `vitest.config.ts`, package verification and consumer scripts. Package contract: `packages/basalt/ai/` and `packages/basalt/scripts/verify-pack.ts`. Machine rules/accidents: global `AGENTS.md` and `rules/`; [Retrospective.md](Retrospective.md).

## Design contract

[DESIGN.md](DESIGN.md) owns component categories, intrinsic sizes, the four-step spacing scale, typography, colors, radii and motion. Components and catalog examples follow it. `bun run design:check` runs only at pre-push, not in normal build/dev or pre-commit.

## Project invariants

- Catalog routes inside `DashboardLayout` use app-local `ShowcasePage`, including all category overviews, documentation and source states. `ContentIsland` owns the page inset; card slots own their padding. Follow [DESIGN.md](DESIGN.md#page-composition), not copied wrapper styles. Structural/token checks run at pre-push only; tests exercise isolated rule fixtures.
- Spacing is role-based: compact controls keep 2/4/6/8px; cards and layouts select 12/16/24/32px (`sm/md/lg/xl`, expressed in rem). Cards/grids default to 16px, page sections to 24px; never enlarge shared control tokens to fix a container.
- Container boundaries have one owner: full-width disclosures use `LayerCard.Header asChild` on `CollapsibleTrigger`, expanded fields use Body inside unstyled content, attached code owns its inset. No native dashboard disclosures, painted/inset-free bars, `p-0` slot repairs or code-frame CSS patches. See DESIGN.md container boundary ownership.
- Selection uses brighter selected tokens and readable labels without decorative side bars or frames, separate from hover/focus/disabled. Never use decorative accent/muted fills for selection. Sidebar group labels are uppercase disclosures, not destination rows. See [DESIGN.md](DESIGN.md#selection-and-navigation-hierarchy).

- Root package is a private catalog; publish only `packages/basalt`. Keep CSS tokens and both Tailwind/standalone entrypoints in the verified tarball; never include secrets.
- Preserve matte surface hierarchy, theme/contrast/accessibility behavior, public API and React client/SSR boundaries described in the integration guide.
- Viewmodels have no View/DOM imports; pages remain thin. Catalog examples use mock data, with no business database or auth service.
- Worker `theme-basalt` serves `dist/`; site CD belongs to `release.yml`, never a parallel laptop deployment. Vite and `worker/index.ts` expose `/api/live`; preserve status/version and production no-store caching. Assets use `not_found_handling = "none"`: the worker serves the app shell for client routes in `src/lib/routes.ts` and `dist/404.html` with HTTP 404 for anything else; register new `<Route>` paths there.
- Keep the Bun lockfile; never delete it for installation. Temporary registry mirrors must not leak into the committed lock. Direct-dependency overrides use the existing `$name` convention.
- Root and published package versions, catalog metadata and changelog must remain aligned for an authorized release.

## Setup and commands

TypeScript 7, Bun 1.4.0, Node 26+ for consumer fixtures. Catalog: Vite 8/React, CSS tokens, Cloudflare Worker assets. Package: React 19 components with optional chart peers and separate import paths. Static/tests: TypeScript, Biome, Vitest/V8, Playwright and built external consumers. `src/` holds pages, models, viewmodels and catalog/lib; `packages/basalt/`, `fixtures/` and `scripts/` hold the publishable library, consumer examples and verification runners.

Run from the root. Consumer gates create temporary external projects and need npm/network access; browser tests need Chromium; the mobile layout gate also needs WebKit. No production secrets or data are required.

```bash
bun install --frozen-lockfile
bun run dev
bun run typecheck
bun run lint
bun run build
bun run test:coverage
bun run --cwd packages/basalt build
bun run playwright:install
bun run consumer:next
bun run test:showcase
bun run test:layouts
bun run package:prepublish
```

`build` performs catalog/API/content/SEO checks and builds the site into `dist/`; the package build separately emits `packages/basalt/dist/`. `package:prepublish` runs types, lint, coverage, package build/types/pack/publint, Tailwind/standalone/Next/heavy/docs consumers, showcase tests and Chromium/WebKit mobile layout tests. Run `consumer:docs` only after building the package.

## Testing and quality contract

System0 uses 12 fixed slots. Statuses are `impl`, `todo`, `na`; every selected check is
check-only and every stage has a timeout. The measured column is warm Home wall time
from the 2026-11-12 migration unless marked otherwise.

| Slot | Status | Command and check object                                                                                                    | Stage                      | Measured |
| ---- | ------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------- |
| S1   | impl   | `bun run typecheck`: catalog/API/content/SEO checks plus app and node `tsc --noEmit`                                        | pre-commit, CI             | 6.1–6.7s |
| S2   | impl   | `bun run lint`: Biome check-only, 0 errors and 0 warnings                                                                   | pre-commit, CI             | 0.3s     |
| S3   | impl   | `bun run scripts/quality/workflow-lint.ts`: actionlint plus full-SHA `uses:` refs                                           | pre-commit (workflows), CI | <1s      |
| G1   | impl   | Gitleaks with `[extend] useDefault = true`: staged index, pushed range, or CI checkout                                      | pre-commit, pre-push, CI   | 4.6–5.0s |
| G2   | impl   | `osv-scanner scan --lockfile=bun.lock --config=osv-scanner.toml`                                                            | pre-push, CI               | 1.1–1.2s |
| B1   | impl   | `bun run --cwd packages/basalt build` and `bun run build`; shared once at pre-push before L1/L4/P1                          | pre-push, CI               | 9.4s     |
| L1   | impl   | `bun run test:coverage`, `scripts/verify-pre-commit-coverage.ts`; consumes shared B1 package output; four 95% floors        | pre-push, CI               | 79.4s    |
| L2   | na     | No `@cloudflare/vitest-pool-workers`/workerd suite; `worker/index.ts` tests run in Node with a mocked `ASSETS` binding (L1) | CI (skipped)               | -        |
| L3   | na     | Static Vite catalog and static-asset Worker; no service, protocol or storage boundary to integrate                          | CI (skipped)               | -        |
| L4   | impl   | `bun run design:check` plus `bun run test:showcase:smoke`, Chromium against shared B1 `dist/`                               | pre-push, CI               | 130.9s   |
| P1   | impl   | `types:check`, `pack:check`, `publint`, then shared-B1 tarball-installed standalone/Tailwind/heavy consumers                | pre-push, CI               | 93.1s    |
| Z1   | impl   | native aggregate over all slots plus blocking `Next.js consumer` and `Hook self-test`; checks results, skips and tested SHA | CI                         | -        |

`L3` is not hidden inside L4: `test:showcase:smoke` is a browser journey, while external
package consumption is P1. `consumer:next` is the blocking Next.js SSR/hydration/HTTP
consumer outside the 12 slots. `Cross-browser layouts (nightly)` and
`Full showcase sweep (nightly)` are non-blocking extensions; they are not in Z1 because
the default gates deliberately keep Chromium and a focused journey set.

| Hook       | Behavior                                                                                                                                                                                                                   | Measured                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| pre-commit | Exports the Git index, rejects manifest/toolchain drift, runs S1, S2, S3 when workflows are staged, and G1 over the index; 10-minute stage budget                                                                          | 12.15–12.48s                  |
| pre-push   | Reads stdin; skips deletions; creates a detached worktree per local OID; reuses modules only for matching manifests, otherwise frozen installs; runs G1/G2/B1 serially, then L1/L4/P1 in parallel on the same B1 artifacts | 145.6s full hook; gate 141.8s |

Install restores Husky. Hooks are check-only; never use `--no-verify` on commits or branch
pushes. CI calls only `./.github/workflows/quality-slots.yml` from job `quality`, so the
required check is `quality / Z1: Gate`. base-ci composites are pinned to
`777bbe4f9bacab8a91d8c01974480a6ee23d28e0` (`v2026.15`); `deploy-worker.yml` uses the same
SHA and passes `required-quality-check: "quality / Z1: Gate"`.

### Measured evidence (2026-11-12)

- **Environment:** Home, Bun 1.4.4 against declared `bun@1.4.0`, Node 26.13.0, actionlint 1.7.12, Gitleaks 8.30.1, OSV Scanner 2.7.0, Python 3.9.6.
- **Coverage (scoped Vitest denominator):** 261 files / 2280 tests; statements **98.10%**, branches **96.62%**, functions **99.09%**, lines **98.33%**; floors **95%** each.
- **pre-commit:** cold **12.48s**, warm **12.15s** after moving full L1 coverage to pre-push. The stage is within the 15s target and the 30s limit; S1 is **6.6–6.8s** and G1 is **4.7–4.8s**.
- **pre-push:** **145.6s** full hook / **141.8s** gate on `ce9cc833` after sharing B1 and running L1/L4/P1 in parallel. B1 **9.4s**, L1 **79.4s**, L4 **130.9s**, P1 **93.1s**; L4 is now the critical path and the 2.5-minute target is met.
- **CI:** native runs measured **389–396s** end to end; the five-minute target is missed, while the ten-minute limit is met. L1 is the critical path at roughly six minutes.
- **Self-test:** `bun run test:gate-self-test` covers healthy execution; S1/S2/S3/G1/G2/B1/L1/L4/P1 failures; missing Gitleaks/actionlint/OSV; scanner failure versus findings; step and stage timeouts; toolchain and lockfile drift; empty coverage; staged/range secrets; pushed OID selection; deleted refs; focus guard; Z1 result, skip, SHA, declaration, blocking-job and output checks.
- **Isolation gap:** consumer gates allocate external temp roots, loopback ports and browser profiles; the showcase build still writes the shared `dist/`.

## Resources and isolation

Dev uses 7003 (`https://basalt.dev.hexly.ai`); browser consumers allocate loopback ports and fresh local profiles. Keep runs separate from daily browser storage and catalog development builds. No D1 database, R2 fixture bucket or remote `-test` Worker is needed.

## Operations / release

Authorized maintainers use `bun run release` to align root/package versions and changelog, push `main`, verify CI, then publish the matching `vX.Y.Z` tag. `release.yml` proves source/run/version, requires `quality / Z1: Gate` on the same SHA, deploys `theme-basalt`, and runs `scripts/deploy-smoke.ts` for production redirects, headers and version. Workers Builds still deploys on push without waiting for Z1; GitHub release deployment is the Z1-gated path.
For npm, pass `bun run package:prepublish`, then publish from `packages/basalt` with the owner's 2FA and the approved registry path. Never publish the repository root. Verify site behavior and `npm view @nocoo/basalt version`; npm and site deployment are distinct results.

## Retrospective

Narratives remain in [Retrospective.md](Retrospective.md); keep recurring project lessons here, cross-project lessons in global rules/nmem and deterministic checks in hooks/tests.
