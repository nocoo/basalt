# Basalt

Matte design system + catalog site. npm `@nocoo/basalt`. Live: `https://basalt.hexly.ai`.
Profile: ts-worker-web
Direction: [INTEGRATION.md](INTEGRATION.md). Numbered `docs/01`–`03` are the 2.0 plan archive, not current SoT. Frameworks must not rewrite this file.

## Sources of Truth

This file is the **contract**. Hooks, CI, and config are **enforcement**. If they disagree, raise enforcement; never lower this file.

| Fact | Where |
|---|---|
| Agent handbook | this file |
| Human docs | README.md, INTEGRATION.md, CHANGELOG.md, `docs/01`–`03` |
| Version | root `package.json` `"version"`; `packages/basalt/package.json` must match; site `src/lib/version.ts` `APP_VERSION` |
| Enforcement | `.husky/*`, `.github/workflows/{ci,release}.yml`, `vitest.config.ts`, `packages/basalt/scripts/verify-pack.ts` |
| Machine rules | global `AGENTS.md`, `rules/git-commit.md` |
| Accidents | [Retrospective.md](Retrospective.md) |

## Project Invariants

- Root `package.json` is private (the site). Never `npm publish` the repo root. Publish only `packages/basalt` (`@nocoo/basalt`).
- Worker name is `theme-basalt`; `[assets]` is `./dist`. `/api/live` is Vite middleware only. No D1. Do not laptop-`wrangler deploy` — site CD is `release.yml`.
- Coverage is models/viewmodels/lib + `packages/basalt/src` (`vitest.config.ts` include). Pages are not in the 95% denominator.
- MVVM: viewmodels have no View/DOM imports; pages stay thin.
- CSS tokens ship in the package. No secrets in the tarball.
- Never `rm bun.lock`. After a mirror install, strip registry URLs before commit (`rg -c --include-zero '", "https' bun.lock` prints 0).

## Stack / Layout

| Component | Choice |
|---|---|
| Language | TypeScript 7 strict |
| Package manager | Bun (`packageManager` bun@1.3.6; CD 1.3.11; CI bun-quality default `latest`) |
| Runtime | Vite 8 SPA; CF Workers assets (`theme-basalt`); npm `@nocoo/basalt` |
| Lint | Biome `check --error-on-warnings .`. No `noSkippedTests` |
| Tests | Vitest L1 95% all four on models/viewmodels/lib + package src |
| Data | mock catalog; no backend |

```
src/pages/  src/viewmodels/  src/models/  src/lib/
packages/basalt/   npm library
docs/              01–03
```

## Commands

```bash
bun dev
bun run typecheck
bun run lint
bun run build
bun run test:coverage
bun run package:prepublish
bun run release
```

## Verification

Status: `enforced` | `planned` | `manual` | `N/A`. `enforced` Evidence = hook/CI/config/script.

Org gaps: index-snapshot pre-commit; stdin-range pre-push; `.skip`/`.only`; CI typecheck (`typecheck-command: "true"` skips it).

Today: pre-commit typecheck/lint/`test` (no coverage)/gitleaks `--staged` on the working tree. pre-push `build` + `test:coverage` + `lint` + osv. CI bun-quality `@aec4adc1a817c56790d1698329ef9398a15a754a` (v2026.5): build, `test:coverage`, gitleaks, osv; typecheck skipped.

| Change | Proof | Status | Evidence |
|---|---|---|---|
| Logic | L1 vitest ≥95% all four on models/viewmodels/lib + package | enforced | pre-push + CI `test:coverage`; `vitest.config.ts`. pre-commit `test` has no thresholds |
| API L2 | — | N/A | — |
| UI L3 | Playwright `consumer:next` | manual | `package:prepublish` (not a hook/CI job) |
| Types / lint | tsc + Biome 0 warning + catalog checks | enforced | pre-commit typecheck + lint. CI lint only |
| G2 secrets | gitleaks | enforced | pre-commit `--staged`; CI bun-quality |
| G2 deps | osv `bun.lock` | enforced | pre-push; CI bun-quality |
| Bundler | `vite build` → `dist/` | enforced | pre-push `build`; CI pre-command; CD `release.yml` |
| Docs | numbered doc / INTEGRATION.md if chrome or API changes | manual | human review |
| Site CD | tag `vX.Y.Z` == root package.json | enforced | `.github/workflows/release.yml` |
| npm `@nocoo/basalt` | `package:prepublish` then publish package dir | manual | `packages/basalt/scripts/verify-pack.ts` |

| Hook | Org bar | Status | Evidence |
|---|---|---|---|
| pre-commit | index snapshot | planned | — |
| pre-push | stdin ref range | planned | — |

`--no-verify` forbidden on commits and branch pushes. Tag-only may skip.

## Resources / Isolation

| Purpose | Port / resource | Isolation |
|---|---|---|
| Dev | 7003 `https://basalt.dev.hexly.ai` | catalog mock; no prod stores |
| Prod | `https://basalt.hexly.ai` (`theme-basalt`) | static assets |

## Operations / Release

- Site: bump root + `packages/basalt` `package.json` + CHANGELOG.md, commit, push `main`, wait CI, then push tag `vX.Y.Z` only. Do not use `bun run release` for prod until it requires `main`, waits CI, and pushes that tag only. Who: GitHub write + `production` Environment + `gh`.
- Tag CD deploys immediately. `main` CD waits CI-green. Do not laptop-`wrangler deploy`.
- npm: `bun run package:prepublish`, then `cd packages/basalt && npm publish --access public --ignore-scripts --registry https://registry.npmjs.org/ --otp=<code>`. Who: `@nocoo/basalt` npm owner with 2FA. Live-check: `https://basalt.hexly.ai` and `npm view @nocoo/basalt`.

## Retrospective

| Kind | Where |
|---|---|
| Accident narrative | [Retrospective.md](Retrospective.md) |
| Recurring project rule | one line here (cap ~10) |
| Checkable rule | hook or test |

- Override a direct dep with `"$name"`.
- Never `rm bun.lock`; strip mirror URLs before commit.
