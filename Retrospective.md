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

- **Exit-presence follow-up:** Closing tooltips now intentionally coexist with the next open tooltip until their exit ends; browser checks must select the active state instead of assuming a single mounted tooltip. The shared typeahead field also removed its conditional portal wrapper so Radix, rather than immediate React unmount, can complete its exit animation.

- **Table integration follow-up:** The actual Tables page retained its own mini-chart implementations after the library replacement. Replacing them exposed screen-reader summaries escaping the table's horizontal scroll boundary because ChartFrame had no positioning context. Delete the page-local chart implementations, position the shared accessible figure relatively, and assert mobile scroll ownership with real charts. Check symbol equivalents as well as direct component references during replacements.

## 2026-10-05: Command highlight geometry and motion probes

The palette styled grouped and ungrouped options with different horizontal insets. One list-owned inset and a single measured background now handle both. Reuse the existing selection observer, include cmdk's selection attributes, and measure offset geometry rather than transformed dialog client rectangles. CSS pseudo-element transitions require `getAnimations({ subtree: true })` in browser probes; direct-element animation enumeration misses the highlight.

## 2026-10-05: Loader and agent catalog integration

Replacing Loader's SVG with a labelled pixel grid required migrating icon-only callers and their exact source/DOM assertions, not keeping an obsolete SVG branch. Catalog scenario counts and API digests also changed. New agent components must update module/symbol ownership and inventory fixtures together with generated documentation. Browser checks must scope to rendered content rather than matching the same text in visible source-code examples; explicit tool button labels keep file names and statuses readable to assistive technology.

## 2026-10-05: Command palette height ownership

The comparison iframe is only 300px tall. CommandPalette's dialog respected its viewport max-height while its fixed-height command content and non-shrinking list overflowed behind the dialog clip, so scrolling could never reveal the last rows. Use a bounded flex column, a fixed search header and a shrinkable list. Browser regression opens the palette before reducing viewport height, then verifies the last row stays inside the visible scrollport; the catalog's sticky navigation otherwise covers the opener at a 160px viewport.

## 2026-10-05: List-level motion and dense defaults

Expanded moving highlights beyond CommandPalette using one private, mounted-list DOM adapter. No React state is updated on pointer movement; callbacks ignore same-row movement and schedule at most one geometry read per animation frame. Scrolling and disabled/hidden rows need explicit handling, including input-driven active descendants outside a portaled list. Legacy CSS-class tests must assert the new shared-layer contract rather than require per-row hover fills. Loader no longer includes a center cell. Form heights changed without reducing multiline text areas or the existing compact-header touch targets.

## 2026-10-05: Dimension token migration boundaries

The token migration initially treated fractional positioning (`top-1/2`) as numeric spacing and left string-based tests asserting obsolete utility names. Fractional/viewport geometry is not a spacing step; keep it unchanged. Role-aware class merging is required so caller overrides still win over named Basalt utilities. Migration scripts must avoid ambiguous token replacements (for example small/default sharing an old height) and unbounded regexes; validate semantic presets and real browser geometry, not only renamed strings. Regenerate landing HTML whenever shared button defaults alter prerendered markup.

## 2026-10-05: Semantic roles must have consumers

After the broad base-scale migration, a final token audit found check-size and menu-row roles declared but not consumed, and Switch thumb travel still used the host scale. Wire roles at their actual leaves and use private steps for travel as well. A semantic token that is merely documented but does not change any component is not an implemented contract. Keep browser tests for host-scale isolation, semantic overrides and scroll containment alongside the structural scan.

## 2026-10-05: Host spacing also affects numeric line height

The final standalone record-table probe changed host `--spacing` and exposed one remaining dependency: Tailwind `leading-5` grew to 45px, inflating otherwise tokenized 36px rows. Migrate numeric line heights in table, tooltip, popover, code, chat and text controls to explicit Basalt line tokens, and retain a browser assertion that the whole row remains 36px under a foreign host spacing scale.
