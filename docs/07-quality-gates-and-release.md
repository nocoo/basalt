# 07 · Quality Gates, Hook Architecture & Release Runbook

Companion reference to [AGENTS.md](../AGENTS.md) covering Basalt's `system1-quality` gate internals, local hook safety mechanisms, measured baseline, and authorized release runbook. Machine truth for CI lives in [`.github/workflows/quality-slots.yml`](../.github/workflows/quality-slots.yml), [`.github/workflows/release.yml`](../.github/workflows/release.yml), and [`scripts/quality/`](../scripts/quality/).

## 1. CI Slot Architecture & Extensions

- `.github/workflows/ci.yml` invokes only `./.github/workflows/quality-slots.yml` from job `quality`, rendering checks as `quality / <ID>: <Name>` with `quality / Z1: Gate` as the single required check on `main`.
- **Slot exceptions (`N/A`):**
  - `L2 Runtime`: `N/A` — no `@cloudflare/vitest-pool-workers`/workerd suite exists; `worker/index.ts` tests run in Node with a mocked `ASSETS` binding (`L1` evidence).
  - `L3 Integration`: `N/A` — static Vite catalog and static-asset Worker with no service, protocol, or storage boundary to integrate. `L3` is not hidden inside `L4`: `test:showcase:smoke` is a browser journey (`L4`), while external package consumption is `P1`.
- **Coverage sharding (`L1`):** CI runs four unit shards (`L1: Unit (Shard 1/4)`..`4/4`, `test:coverage:shard`) consuming the shared `B1` package artifact and merges them in `L1: Unit` with `scripts/merge-coverage.ts` rather than Vitest's blob merge (which dropped one duplicate same-location function from the denominator). `scripts/verify-pre-commit-coverage.ts` verifies the four 95% floors (`statements`, `branches`, `functions`, `lines`) over `src/models/**/*.ts`, `src/viewmodels/**/*.ts`, `src/lib/**/*.ts`, and `packages/basalt/src/**/*.{ts,tsx}`.
- **Additional in-slot blocking jobs (aggregated by `Z1`):**
  - `P1: Package (Next.js)` (`bun run consumer:next`): Next.js tarball install, SSR, hydration, and real HTTP.
  - `L1: Unit (Pre-commit Gate)` (`bun run test:gate-self-test`).
- **Non-blocking nightly workflow (`.github/workflows/nightly.yml`, `schedule` / `workflow_dispatch`):**
  - `Cross-browser layouts (nightly)` (`bun run test:layouts`, Chromium + WebKit).
  - `Full showcase sweep (nightly)` (`bun run test:showcase`).
  - Separated from `ci.yml` / `Z1` so default gates keep Chromium and a focused journey set.

## 2. Local Hooks & Process Safety

`bun install` runs `prepare` (`husky`) and `postinstall` (`bun run scripts/quality/install-fingerprint.ts write`). Hooks are check-only; never pass `--no-verify`.

- **Install fingerprint proof:** `postinstall` records manifest, lockfile, and Bun toolchain hashes in `node_modules/.cache/`. Hooks link the installed `node_modules` tree into an exported snapshot or detached worktree only when the fingerprint matches the target tree; missing or stale proofs trigger an isolated `bun install --frozen-lockfile` (`pre-push`) or a clear failure (`pre-commit`).
- **Process-group registry (`PgidRegistry`):** every detached process group spawned by quality tooling is registered in `scripts/quality/process.ts`. On `SIGINT`/`SIGTERM`, a step timeout, or the supervisor hard deadline (`scripts/quality/supervisor.ts`), the entire owned process tree is terminated with no orphans.
- **`pre-commit` (`.husky/pre-commit` -> `scripts/quality/hook-pre-commit.sh`):** supervisor enforces deadline and interrupts; body exports the staged Git index to a temp snapshot, rejects manifest/toolchain drift against the worktree, verifies the install fingerprint, then runs `S1` (`bun run typecheck`), `S2` (`bun run lint`), `S3` (`bun run scripts/quality/workflow-lint.ts`, when `.github/workflows/` changes are staged), and `G1` (Gitleaks on staged index with `[extend] useDefault = true`).
- **`pre-push` (`.husky/pre-push` -> `scripts/quality/hook-pre-push.sh`):** supervisor reads stdin, enforces deadline and interrupts; body skips deleted refs, creates a detached worktree per local OID, reuses installed modules only on a matching fingerprint (else frozen install), scans the pushed range (`G1`, full reachable history for a new ref), runs `G1`/`G2`/`B1` serially, then runs `L1`/`L4`/`P1` in parallel sharing the same `B1` package and site artifacts.
- **Isolation gap:** external consumer gates allocate temp roots, loopback ports, and fresh browser profiles; the showcase build (`B1` / `test:showcase`) still writes the shared `dist/`.

### Hook self-test scope (`bun run test:gate-self-test`)

Verifies healthy execution; `S1`/`S2`/`S3`/`G1`/`G2`/`B1`/`L1`/`L4`/`P1` failures; missing Gitleaks/actionlint/OSV; scanner failure vs findings; unresolvable and empty secret ranges; step and stage timeouts; hanging hook and descendant cleanup; supervisor `SIGINT`/`SIGTERM` before and after hook start (including registered process groups); hanging tool query and detached HTTP server under step timeout; toolchain and lockfile drift; empty coverage; staged-index and pushed-range secrets; pushed OID selection; new-ref range scanning commits; deleted refs; install fingerprint reuse, missing, and stale proofs; focus guard; and Z1 result, skip, SHA, declaration, blocking-job, and output checks.

## 3. Measured Baseline (2026-11-12 Migration)

Reference wall times recorded on Home (Bun 1.4.4 vs declared `bun@1.4.0`, Node 26.13.0, actionlint 1.7.12, Gitleaks 8.30.1, OSV Scanner 2.7.0, Python 3.9.6):

- **Scoped Vitest coverage:** 267 files / 2,296 tests (+15 regression tests over 265 / 2,281 with unchanged denominator); statements **98.10%** (4,603/4,692), branches **96.62%** (4,498/4,655), functions **99.09%** (1,211/1,222), lines **98.33%** (4,309/4,382); floors 95% each.
- **Warm local slots:** `S1` 6.1–6.8s, `S2` 0.3s, `S3` <1s, `G1` 4.6–5.0s, `G2` 1.1–1.4s, `B1` 9.4–9.9s, `L1` 79.4–83.5s, `L4` 130.7–130.9s (local critical path), `P1` 93.1–96.8s.
- **`pre-commit`:** 11.5s latest real commit (cold 12.48s / warm 12.15s), within 15s target and 30s limit.
- **`pre-push`:** 138.4–141.9s gate / 143.5–147.0s push after sharing `B1` and running `L1`/`L4`/`P1` in parallel, meeting 2.5-minute target.
- **CI:** 274–275s (4:34–4:35) end-to-end on `a828295f` and `dea25554` (0s queue, 2–3s setup; `B1` 46–49s; four unit shards 95–153s across 67/66/66/66 files and 422/469/748/642 tests; `L1` merge/verify 19–21s; `L4` 149–161s; `P1` 258–263s critical path; `Z1` 7–8s), within 5-minute target and 10-minute limit.

## 4. Release & Publishing Runbook

All releases and deployments require explicit authorization. Site deployment and npm publishing are distinct operations and must both be verified independently.

### Catalog site (Cloudflare Worker `theme-basalt`)

1. Run `bun run release` to align root `package.json`, `packages/basalt/package.json`, `src/lib/version.ts`, catalog metadata, and `CHANGELOG.md`.
2. Push `main` and verify CI (`quality / Z1: Gate`) passes on that commit SHA.
3. Push the matching `vX.Y.Z` tag.
4. `.github/workflows/release.yml` proves source, run, and version alignment, requires `quality / Z1: Gate` on the same SHA, deploys Worker `theme-basalt`, and runs `bun scripts/deploy-smoke.ts` to check production redirects, headers, and `/api/live` version.
5. Never deploy `theme-basalt` directly from a laptop. Note: Cloudflare Workers Builds still deploys on push without waiting for `Z1`; GitHub `release.yml` is the Z1-gated production path.

### npm package (`@nocoo/basalt`)

1. Pass `bun run package:prepublish` (types, lint, coverage, package build/types/pack/publint, Tailwind/standalone/Next/heavy/docs consumers, showcase tests, and Chromium/WebKit mobile layout tests).
2. Publish from `packages/basalt` with the owner's 2FA and the approved registry path. Never publish the private repository root.
3. Verify live site behavior at `https://basaltui.com` and confirm `npm view @nocoo/basalt version`.
