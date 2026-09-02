# Basalt — Project Notes

## Version Management

### Single Source of Truth

The **canonical version** lives in the **root** `package.json` → `"version"`.
Edit that field only. Never hardcode a version string in source, docs
badges, or tests.

| Consumer | Mechanism |
|---|---|
| Site sidebar badge (`vX.Y.Z`) | `__APP_VERSION__`, injected via `vite.config.ts` → `define` |
| `/api/live` | Vite plugin reads root `package.json` at request time |
| `vitest.config.ts` | Same `define` pattern |
| TypeScript | `src/vite-env.d.ts` → `declare const __APP_VERSION__: string` |
| `@nocoo/basalt` | `packages/basalt/package.json` `"version"` **must equal** the root. `packages/basalt/scripts/verify-pack.ts` fails the pack gate if they drift. Copy the root value when bumping; do not invent a second number. |

Root `package.json` is `"private": true` (the site). The npm package is
`packages/basalt` (`@nocoo/basalt`, public). Publishing the repo root is
forbidden (`EPRIVATE`).

### Versioning Rules (SemVer)

- **MAJOR** — breaking changes to public API, routes, or data models
- **MINOR** — new features, pages, or components (backward-compatible)
- **PATCH** — bug fixes, styling tweaks, dependency bumps
- **Prerelease** — `X.Y.Z-rc.N` (or `-alpha` / `-beta`). Site and package
  stay on the same string.

### Release Checklist

Site deploy follows the tag. npm publish is a separate step on
`packages/basalt` only.

1. **Bump** root `package.json` `"version"`, then copy the same string to
   `packages/basalt/package.json`.
2. **CHANGELOG.md** — `## [x.y.z] - YYYY-MM-DD` (Keep a Changelog).
3. **Commit**: `chore: release vX.Y.Z` (husky: typecheck, lint, test).
4. **Package gates**: from repo root, `bun run package:prepublish`
   (typecheck, lint, coverage, package build, types, pack:check, publint,
   consumer gates A/B/C/D). `consumer:next` runs Chromium.
5. **npm publish** from `packages/basalt`, never the repo root:
   - Stable: `npm publish --access public --registry https://registry.npmjs.org/`
   - Prerelease: add `--tag rc` (or `alpha` / `beta`) so later stables
     keep `latest`. A **new** package's first publish also becomes
     `latest` (npm behavior). Install with `@nocoo/basalt@X.Y.Z-rc.N`
     or `@rc`.
   - 2FA: `--otp=<code>`. After a green `package:prepublish` in the same
     tree, `--ignore-scripts` is allowed so OTP is not racing another
     coverage run.
6. **Tag**: `git tag -a vX.Y.Z -m "vX.Y.Z"` (immutable).
7. **Push**: `git push && git push --tags`.
8. **GitHub Release**: `gh release create vX.Y.Z --title "vX.Y.Z"` with
   the CHANGELOG section. Add `--prerelease` when the version contains
   `-alpha`, `-beta`, or `-rc`.
9. Confirm `npm view @nocoo/basalt@version` and `gh run list --limit 5`.

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
- Tag name matches root `package.json` version prefixed with `v`
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
