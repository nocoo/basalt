# Basalt

Matte React design system and catalog at `https://basaltui.com`; npm package `@nocoo/basalt`.
Profile: ts-worker-web with a published component-library lane.
Direction: [INTEGRATION.md](INTEGRATION.md); numbered `docs/01`–`03` describe the 2.0 plan rather than current API truth. Frameworks must not rewrite this file.

## Sources of Truth

This file is the contract; hooks, CI and configuration enforce it. Raise weaker enforcement instead of lowering this contract.

| Fact | Where |
|---|---|
| Human/API docs | [README.md](README.md), [INTEGRATION.md](INTEGRATION.md), [package README](packages/basalt/README.md) |
| Version | Root and `packages/basalt/package.json` must match; site uses `src/lib/version.ts` |
| Enforcement | `.husky/`, CI/release workflows, `vitest.config.ts`, package verification and consumer scripts |
| Package contract | `packages/basalt/ai/`, `packages/basalt/scripts/verify-pack.ts` |
| Machine rules / accidents | Global `AGENTS.md` and `rules/`; [Retrospective.md](Retrospective.md) |

## Project Invariants

- Root package is a private catalog; publish only `packages/basalt`. Keep CSS tokens and both Tailwind/standalone entrypoints in the verified tarball; never include secrets.
- Preserve matte surface hierarchy, theme/contrast/accessibility behavior, public API and React client/SSR boundaries described in the integration guide.
- Viewmodels have no View/DOM imports; pages remain thin. Catalog examples use mock data, with no business database or auth service.
- Worker `theme-basalt` serves `dist/`; site CD belongs to `release.yml`, never a parallel laptop deployment. Vite and `worker/index.ts` expose `/api/live`; preserve status/version and production no-store caching.
- Keep the Bun lockfile; never delete it for installation. Temporary registry mirrors must not leak into the committed lock. Direct-dependency overrides use the existing `$name` convention.
- Root and published package versions, catalog metadata and changelog must remain aligned for an authorized release.

## Stack / Layout

| Component | Choice |
|---|---|
| Runtime / install | TypeScript 7, Bun 1.4.0, Node 24+ for consumer fixtures |
| Catalog | Vite 8/React, CSS tokens, Cloudflare Worker assets |
| Package | React 19 components with optional chart peers and separate import paths |
| Static / tests | TypeScript, Biome, Vitest/V8, Playwright and built external consumers |
| `src/` | Pages, models, viewmodels, catalog/lib |
| `packages/basalt/`, `fixtures/`, `scripts/` | Publishable library, consumer examples and verification runners |

## Commands

Run from the root. Consumer gates create temporary external projects and need npm/network access; browser tests need Chromium. No production secrets or data are required.

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
bun run package:prepublish
```

`build` performs catalog/API/content/SEO checks and builds the site into `dist/`; the package build separately emits `packages/basalt/dist/`. `package:prepublish` runs types, lint, coverage, package build/types/pack/publint, Tailwind/standalone/Next/heavy/docs consumers and showcase tests. Run `consumer:docs` only after building the package.

## Verification

6DQ = L1/L2/L3 + G1/G2 + D1. Status: `enforced`, `planned`, `manual`, `N/A`.

| Dimension | Required proof | Status | Current enforcement / gap |
|---|---|---|---|
| L1 logic | Statements, branches, functions and lines each ≥95%; no `.skip` / `.only` | enforced | Pre-commit runs on a staged index snapshot (checkout-index export, per-entry node_modules links, staged-source package build) and enforces all four Vitest thresholds by exit status; Biome `noFocusedTests`/`noSkippedTests`, `allowOnly: false`, `passWithNoTests: false` and a selected-run reporter reject focused/skipped/empty runs; CI reproduces the same floors after package prepare |
| L2 HTTP/package | Real HTTP consumer/SSR and build artifact contracts | enforced | CI package gates build real external consumers and validate HTTP responses; no business CRUD API or database exists |
| L3 UI | Real component integration and catalog journeys | enforced | CI `consumer:next`, other browser consumers and `test:showcase` run Chromium |
| G1 static | Strict types and check-only lint, zero errors/warnings | enforced | Commit/CI typecheck and Biome, generated catalog/API/content/SEO checks, package declaration/pack/publint checks |
| G2 security | Dependency and secret scans; missing scanner fails | enforced | Staged Gitleaks at commit, OSV at push, shared CI scans; push-ref secret selection is still incomplete locally |
| D1 isolation | Per-run local consumers/browser state, guarded cleanup, no daily-dev/prod | planned | Consumer scripts allocate checked external temp roots, ephemeral ports and browser profiles; showcase rebuilds shared `dist/`, so complete per-run build isolation remains missing |
| Build | Site and published package built separately | enforced | Pre-push/CI site build; CI package-gates build library |
| Docs / npm | Public API, version and verified tarball review | manual | Integration/compatibility docs and authorized npm publication |

| Hook | Current behavior | Required follow-up |
|---|---|---|
| pre-commit | Staged index snapshot: staged-source package build, typecheck, lint, UT with all four coverage floors, skip/only/empty rejection, staged Gitleaks | Reduce full-gate wall time (~8 min on a loaded host) toward the <30s target |
| pre-push | Working-tree build/coverage/lint, OSV | Applicable integration+G2 on stdin push refs, <3min |

Install restores Husky. Hooks are check-only; never use `--no-verify` on commits or branch pushes. CI uses pinned `base-ci/quality.yml` and `test-job.yml` at `ad43150de3a2be2fa464b5cd2f921dc4fa9f8f0f`.

## Resources / Isolation

Dev uses 7003 (`https://basalt.dev.hexly.ai`); browser consumers allocate loopback ports and fresh local profiles. Keep runs separate from daily browser storage and catalog development builds. No D1 database, R2 fixture bucket or remote `-test` Worker is needed.

## Operations / Release

Authorized maintainers use `bun run release` to align root/package versions and changelog, push `main`, verify CI, then publish the matching `vX.Y.Z` tag. `release.yml` proves source/run/version before Worker deployment and runs `scripts/deploy-smoke.ts` for production redirects, headers and version.
For npm, pass `bun run package:prepublish`, then publish from `packages/basalt` with the owner's 2FA and the approved registry path. Never publish the repository root. Verify site behavior and `npm view @nocoo/basalt version`; npm and site deployment are distinct results.

## Retrospective

Narratives remain in [Retrospective.md](Retrospective.md); keep recurring project lessons here, cross-project lessons in global rules/nmem, and deterministic checks in hooks/tests.
