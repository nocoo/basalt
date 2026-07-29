# Basalt — Project Notes

## Version Management

### Single Source of Truth

The **canonical version** lives in `package.json` → `"version"`. All other
consumers derive from it at build time:

| Consumer | Mechanism |
|---|---|
| Sidebar badge (`v1.0.0`) | `__APP_VERSION__` global, injected via `vite.config.ts` → `define` |
| `/api/live` endpoint | Vite dev-server plugin reads `package.json` at request time |
| `vitest.config.ts` | Same `define` pattern for test environment |
| TypeScript | Declared in `src/vite-env.d.ts` as `declare const __APP_VERSION__: string` |

**Never hardcode a version string anywhere.** Always read from `package.json`.

### Versioning Rules (SemVer)

- **MAJOR** — breaking changes to public API, routes, or data models
- **MINOR** — new features, pages, or components (backward-compatible)
- **PATCH** — bug fixes, styling tweaks, dependency bumps

### Release Checklist

1. **Bump version** in `package.json`
2. **Update `CHANGELOG.md`** — add a new `## [x.y.z] - YYYY-MM-DD` section
3. **Run full verification**: `bun run lint && bun run build && bun run test`
4. **Commit**: `chore: release vX.Y.Z`
5. **Tag**: `git tag -a vX.Y.Z -m "vX.Y.Z"`
6. **Push**: `git push && git push --tags`
7. **GitHub Release**: `gh release create vX.Y.Z --title "vX.Y.Z" --notes-from-tag`
   - Attach build artifacts if applicable
   - Copy the relevant CHANGELOG section into release notes

### CHANGELOG Format

Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/):

```markdown
## [x.y.z] - YYYY-MM-DD
### Added
### Changed
### Fixed
### Removed
```

### Git Tag Convention

- Annotated tags only: `git tag -a vX.Y.Z -m "vX.Y.Z"`
- Tag name matches `package.json` version prefixed with `v`
- Tags are immutable — never delete or move a published tag

### GitHub Release Convention

- Title: `vX.Y.Z`
- Body: copy of the CHANGELOG section for that version
- Mark as pre-release if version contains `-alpha`, `-beta`, `-rc`

## Retrospective

### `overrides` for a direct dependency must use the `$name` form

npm refuses an override for a package that is also a direct dependency
unless both specs match **verbatim** — `^8.5.18` against a direct
`8.5.22` is semantically compatible but still fails:

```
npm error code EOVERRIDE
npm error Override for postcss@8.5.22 conflicts with direct dependency
```

Always write `"postcss": "$postcss"` instead. The reference form tracks
the direct dependency automatically, so upgrades only touch one place.

This surfaces **only in the Cloudflare deploy step**: `bun install` and
`vite build` ignore the rule, and `npx wrangler versions upload` is the
one command that resolves the tree through npm. CI stays fully green
while Workers Builds fails — do not read a green CI as "deps are fine".

### Regenerating `bun.lock` when only a mirror is reachable

A mirror install rewrites every entry with `https://mirrors.../*.tgz`,
which pins CI to that mirror permanently. Two rules make it safe:

1. **Never `rm bun.lock` first.** A full re-resolve drifts versions
   (postcss silently went `8.5.22` → `8.5.24`). Edit `package.json` and
   let `bun install` update the lockfile incrementally.
2. **Strip the URLs afterward**, then verify against the committed file:
   ```bash
   perl -pi -e 's/(\["[^"]+", )"https:\/\/[^"]*"(, )/$1""$2/g' bun.lock
   rg -c '", "https' bun.lock          # must be 0
   git diff bun.lock                    # must be only the intended lines
   ```
   `bun install --frozen-lockfile` accepts the stripped file and does not
   write the URLs back.

### `~/.npmrc` overrides the registry for bun too

A `registry=` line in `~/.npmrc` silently redirects `bun install`. An
apparent "network is down" (dozens of `ConnectionClosed`) may just be an
unreachable proxy configured there — check it before concluding the
network is unusable, and probe registries with
`curl -sL --max-time 8 <mirror>/react` rather than guessing.

### Don't infer build duration from GitHub check-run timestamps

For Cloudflare Workers Builds, `started_at` and `completed_at` are the
same instant (the moment the result is written back), not the real build
window. A "0-second failure" says nothing about whether the build ran —
read the actual build log before diagnosing.
