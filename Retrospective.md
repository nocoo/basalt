# Retrospective

Accident narratives for this repo.

Routing: narrative stays here. A project-specific rule that will recur may become one line in `CLAUDE.md`. Cross-project lessons go to nmem or a global rule. If it can be checked by a machine, add a hook or test instead of prose.

## 2026-09: Deployment ignored Worker-first asset routing

- **What:** The v2.1.3 main deployment succeeded, but existing static pages on www returned 200 instead of redirecting to the apex, and lacked the Worker's security headers. `/api/live` redirected correctly.
- **Why:** `wrangler-action@v3` installed Wrangler 3.90.0, which warned about and ignored `assets.run_worker_first`. Unit tests exercised the handler directly and could not detect the deployment tool ignoring its routing configuration.
- **Follow-up:** Pin Wrangler 4.130.0 and Node 24 in both CD paths. After deployment, check real static and API redirects, security headers, prerendered HTML, and the version from the root manifest. Verify the checks fail against the old deployment and pass against the Wrangler 4 local asset runtime.

## 2026-09: Release generation used stale installed dependencies

- **What:** v2.1.3 passed local hooks but failed the clean CI SEO check before tagging or deployment.
- **Why:** Release synchronized `bun.lock` with `--lockfile-only`, leaving the installed Lucide version at 1.41.0 while the manifest and lockfile required 1.42.0. The versions emitted different SVG classes in prerendered HTML.
- **Follow-up:** Install with `--frozen-lockfile` before generating release artifacts. Regression tests require installation before generation and stop publication on installation failure; regenerate the homepage against the locked dependencies.

## 2026-04: npm override for a direct dependency

- **What:** `overrides` for a package that is also a direct dependency failed at Cloudflare deploy (`EOVERRIDE`) unless both specs matched verbatim. `bun install` / `vite build` did not catch it.
- **Why:** `npx wrangler versions upload` resolves through npm. CI green is not "deps are fine".
- **Follow-up:** CLAUDE.md rule: override a direct dep with `"$name"`.

## 2026-04: Regenerating bun.lock through a mirror

- **What:** A mirror install rewrote every lockfile URL to `https://mirrors.../*.tgz`, pinning CI to that mirror. `rm bun.lock` first also drifted versions.
- **Why:** bun records the registry URL it used. Frozen CI then hits the mirror forever.
- **Follow-up:** CLAUDE.md rule: never `rm bun.lock`; strip mirror URLs before commit.

## 2026-04: ~/.npmrc silently redirects bun

- **What:** `registry=` in `~/.npmrc` made `bun install` look like a network outage.
- **Why:** bun honors npmrc. Probe the registry with curl before blaming the network.
- **Follow-up:** nmem / global `rules/tool-npm.md`.

## 2026-04: Workers Builds timestamps are not duration

- **What:** Cloudflare Workers Builds `started_at` and `completed_at` are the same instant.
- **Why:** GitHub check-run timestamps are when the result is written back, not the build window.
- **Follow-up:** none (read the build log).
