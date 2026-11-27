# Basalt

Matte React design system and catalog (`https://basaltui.com`; npm `@nocoo/basalt`; `ts-worker-web` + library lane).
Docs: [README](README.md) · [DESIGN](DESIGN.md) · [INTEGRATION](INTEGRATION.md) · [Package](packages/basalt/README.md) · [Route Surfaces](docs/06-route-surfaces-and-harness.md) · [Gates & Release](docs/07-quality-gates-and-release.md) · [Retrospective](Retrospective.md)

Sole project handbook; raise weaker hooks/CI instead of lowering it, and prevent frameworks from rewriting it. `docs/01`–`05` are historical plans/audits, not current API or quality truth.

## Commands

Run from root (TS 7, Bun 1.4.0, Node 26+ for consumers). Consumer gates need network; browser gates need Chromium (`test:layouts` also needs WebKit). No prod secrets needed.

```sh
bun install --frozen-lockfile # Husky + install fingerprint
bun run dev # https://basalt.dev.hexly.ai -> 127.0.0.1:7003
bun run typecheck # S1: tsc (app/node)
bun run lint # S2: Biome check-only, 0 errors / 0 warnings
bun run build # catalog/SEO checks + site dist/
bun run --cwd packages/basalt build # library packages/basalt/dist/
bun run test:coverage # L1: Vitest/V8 (>=80% four floors)
bun run playwright:install # Chromium + WebKit
bun run consumer:next # blocking Next.js install/build/SSR
bun run test:showcase # full catalog showcase suite
bun run test:layouts # Chromium + WebKit mobile layouts
bun run package:prepublish # full pre-npm gate (pack/publint/consumers/e2e)
```

Run `bun run consumer:docs` only after building the package. `bun run design:check` and `bun run test:browser` run in `L4`, not dev/build/pre-commit.

## Invariants

- **Design contract**: [DESIGN.md](DESIGN.md) owns component categories, intrinsic sizes, spacing, type, colors, radii, and motion; follow it rather than local overrides.
- **Page composition**: All `DashboardLayout` routes use `ShowcasePage`; `ContentIsland` owns page inset and card slots own padding ([DESIGN.md](DESIGN.md#page-composition)).
- **Role-based spacing**: Controls use 2/4/6/8px; cards/layouts use 12/16/24/32px (`sm/md/lg/xl` rem; 16px cards/grids, 24px sections); never enlarge control tokens ([DESIGN.md](DESIGN.md#spacing)).
- **Container boundaries**: Disclosures use `LayerCard.Header asChild` on `CollapsibleTrigger`, Body in unstyled content, attached code owns inset; no `p-0` slot repairs or native dashboard disclosures.
- **Selection & nav**: Selected contrasts with its container (light smoked tint + hairline edge, dark raised neutral; no bars or accent/muted fills), distinct from hover/focus/disabled; sidebar groups are disclosures ([DESIGN.md](DESIGN.md#selection-and-navigation-hierarchy)).
- **Package boundary**: Root is private; publish only `packages/basalt` with CSS tokens and Tailwind + standalone entrypoints (`packages/basalt/scripts/verify-pack.ts`); never include secrets.
- **Architecture & API**: Preserve matte surfaces, theme/a11y, public API (`packages/basalt/ai/`), and client/SSR boundaries ([INTEGRATION.md](INTEGRATION.md)); ViewModels never import Views/DOM; mock data only.
- **Worker & routes**: Worker `theme-basalt` serves `dist/` (`not_found_handling = "none"`): app shell for `src/lib/routes.ts`, `dist/404.html` (404) otherwise; keep `/api/live` status/version and prod `no-store`.
- **Surfaces & harness**: Templates (`src/templates/`) import only `@nocoo/basalt/*` + standalone classes; use `/dev/examples` for isolated checks ([route surfaces](docs/06-route-surfaces-and-harness.md)).
- **Contract sync**: Core primitive, surface, or template changes update `DevExamplesPage.tsx`, `TEMPLATE_MANIFEST`, `src/lib/routes.ts`, and byte-identical `DESIGN.md` / `packages/basalt/ai/DESIGN.md` together.
- **Lockfile & overrides**: Never delete `bun.lock` or commit mirror URLs in it; direct-dependency overrides use `$name`.
- **Release**: Keep root/`packages/basalt` versions, `src/lib/version.ts`, metadata, and `CHANGELOG.md` aligned; site CD runs automatically on `main` push (or `workflow_dispatch` with `deploy=true`) via `pipeline.yml` (`D1`–`D5` reusing `B1` `basalt-site-dist`), npm publishes locally with 2FA ([runbook](docs/07-quality-gates-and-release.md)).

## Quality & Local Gates

Follows `system1-quality`; `.github/workflows/pipeline.yml` orchestrates `quality` (`S1`–`Z1` in `.github/workflows/quality-slots.yml`, `quality / Z1: Gate` required on `main`) followed by `deploy` (`D1`–`D5` via `base-ci` `deploy-worker.yml` `v2026.24` on `main` only; `pull_request` runs skip `deploy`). Statuses: `enforced`, `planned`, `manual`, `N/A`.

- **Exceptions**: `L2 Runtime` is `N/A` (Worker tests mock `ASSETS` in Node/L1; no workerd suite); `L3 Integration` is `N/A` (static catalog/Worker, no service/storage boundary).
- **Coverage & CI jobs**: `L1` enforces 80% on all four metrics across `src/{models,viewmodels,lib}` and `packages/basalt/src` (excluding showcase Views); `P1: Package (Next.js)` blocks in `Z1`; nightlies live in `.github/workflows/nightly.yml` and are non-blocking.
- **Local hooks**: `bun install` (`prepare`) installs `.husky/`; `pre-commit` checks staged index (`S1/S2/S3/G1`), `pre-push` checks per-OID worktrees (`G1/G2/B1` serial, `L1/L4/P1` parallel); never `--no-verify`.
- **Gate safety**: Hooks reuse `node_modules` only on a verified install fingerprint and register detached process groups in `PgidRegistry` ([gates & release](docs/07-quality-gates-and-release.md)).

## Resources & Isolation

| Lane  | Endpoint / State                            | Boundary                                                          |
| ----- | ------------------------------------------- | ----------------------------------------------------------------- |
| Dev   | `127.0.0.1:7003` (`basalt.dev.hexly.ai`)    | Local catalog; mock data, no DB/auth/R2                           |
| Tests | Temp roots, loopback ports, fresh profiles  | Isolated storage; showcase build writes shared `dist/`            |
| Prod  | `https://basaltui.com`, npm `@nocoo/basalt` | `pipeline.yml` (`Z1`-gated `D1`–`D5`) for site; local 2FA for npm |

## Retrospective

Record incident narratives in [Retrospective.md](Retrospective.md); promote recurring project constraints to `Invariants` above and enforceable safeguards to tests or hooks.
