# Retrospective

Accident narratives for this repo.

Routing: narrative stays here. A project-specific rule that will recur may become one line in `CLAUDE.md`. Cross-project lessons go to nmem or a global rule. If it can be checked by a machine, add a hook or test instead of prose.

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
