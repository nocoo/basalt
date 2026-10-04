# Retrospective

Accident narratives for this repo.

Routing: narrative stays here. A project-specific rule that will recur may become one line in `AGENTS.md`. Cross-project lessons go to nmem or a global rule. If it can be checked by a machine, add a hook or test instead of prose.

## 2026-09: Type-equivalence fixture compiled unrelated ambient types

- **What:** The first full coverage run after the 2026-09-23 dependency repairs timed out one `scripts/catalog-type-printer.test.ts` test (default 5s) under suite load; no assertion failed.
- **Why:** The fixture tsconfig set no `types`, so both compiler passes (typescript-api generator program and the spawned `tsc.js` proof compile) parsed and bound `@types/node` and `@types/react-dom` that no fixture or transitively imported source uses. No profile tied the ~88ms overrun to that work specifically; it is avoidable compiler work inside the timed window and a likely contention contributor, not a proven sole cause of the timeout.
- **Follow-up:** The fixture pins `compilerOptions.types: []`; React, recharts, and peer types still resolve as explicit module imports. Diagnose timeouts from the failing window's actual cost graph, not from a rerun outcome.

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
- **Follow-up:** AGENTS.md rule: override a direct dep with `"$name"`.

## 2026-04: Regenerating bun.lock through a mirror

- **What:** A mirror install rewrote every lockfile URL to `https://mirrors.../*.tgz`, pinning CI to that mirror. `rm bun.lock` first also drifted versions.
- **Why:** bun records the registry URL it used. Frozen CI then hits the mirror forever.
- **Follow-up:** AGENTS.md rule: never `rm bun.lock`; strip mirror URLs before commit.

## 2026-04: ~/.npmrc silently redirects bun

- **What:** `registry=` in `~/.npmrc` made `bun install` look like a network outage.
- **Why:** bun honors npmrc. Probe the registry with curl before blaming the network.
- **Follow-up:** nmem / global `rules/tool-npm.md`.

## 2026-04: Workers Builds timestamps are not duration

- **What:** Cloudflare Workers Builds `started_at` and `completed_at` are the same instant.
- **Why:** GitHub check-run timestamps are when the result is written back, not the build window.
- **Follow-up:** none (read the build log).

## 2026-09-29: Misidentified a loading animation reference

- **What:** Interpreted the requested earlier wave animation as expanding circles. The user meant the pulsing waveform below the logo in the first study's Current variant.
- **Why:** Matched the word "ripple" to a new visual instead of checking the existing study and its position relative to the logo.
- **Follow-up:** Resolve references to earlier designs against their actual markup and motion before implementing. The revised preview uses Current's staggered waveform beneath a stationary 48px HD logo.

## 2026-10-02: SWC native cache and dependency pin proof

- **What:** The SWC patch upgrade initially failed its normal staged-index hook because the native loader rejected the macOS temporary cache path through `/var`. After using an owned canonical cache, the full suite exposed a test still asserting the old SWC pin.
- **Fix:** Use a per-run canonical native cache and temporary directory without weakening the hook, and update the exact version assertion to the requested pin.
- **Follow-up:** Search dependency-version contracts before upgrades. Keep native-loader path validation and exact dependency assertions enabled.

- **Permanent correction:** The hook now canonicalizes its newly created snapshot directory and creates the owned XDG cache before native tools run. All existing staged-source, static, coverage and secret checks remain unchanged; the next commit validates the default macOS temporary environment without the run-local SWC cache override.

## 2026-10-02: npm pack JSON package container

- **What:** The package gate reported every file missing although the real npm12 dry-run listed the complete artifact.
- **Why:** The parser sliced braces and assumed the artifact itself was the JSON root; npm now groups artifacts by package name.
- **Fix:** Parse the complete JSON container, require exactly one artifact with the expected name/version, then retain every existing file/export/hash check. The real local package check passed after the correction.

## 2026-10-02: Responsive shell contract and Safari opener tracking

- **What:** The first shell commit was correctly blocked because the catalog target fixture still allowed an empty ContentIsland API and its generated digest still described the old props. Browser validation also found that WebKit returned list/detail focus to the region instead of the clicked item.
- **Why:** Adding a prop changes both the generated API and the pinned generator contract. Safari can focus a region rather than a clicked button; focus capture then overwrote the pointer-captured opener.
- **Fix:** Update both exact API assertions, and only capture descendant focus as a new opener. Keep the pointer target when the region itself receives focus. A targeted regression and Chromium/WebKit layout checks cover the behavior; actual iPhone toolbar/keyboard behavior remains a manual device check.

- **Gate follow-up:** The repository's selected-run reporter intentionally rejects `-t` name filters as skipped tests. Run complete selected test files when investigating a gate failure; never suppress the reporter. New release pipeline steps also require updating the pinned positive and negative pipeline contract tests.

- **Release preparation:** The release script deliberately keeps the manifest mutation helper private. Reuse only its actual exported lockfile/changelog helpers after inspecting exports; a failed import caused no file writes. The normal release entrypoint also pushes/tags, so staged npm readiness uses explicit local version preparation rather than starting external publication early.

## 2026-10-05: Motion checks need actual catalog boundaries

- **What:** Initial motion probes selected duplicated hero/example triggers, then assumed every hero contained a table-specific `data-demo` marker. An immediate focus assertion also ran before Radix's close-focus cleanup.
- **Fix:** Scope interaction checks to the existing `data-hero-scenario` boundary, sample real CSS animations, and wait for focus restoration after exit unmount. Do not infer selectors from a different component's showcase. Shell wrappers must also avoid zsh's read-only `status` variable when preserving exit codes.

- **Gate follow-up:** The staged-index hook caught a catalog test still looking for the old Sheet trigger text. When an example label or description changes, update its existing contract assertion in the same commit; targeted component tests alone cannot prove catalog consistency.
