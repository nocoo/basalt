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
3. **Run full verification**: `bunx eslint . && bun run build && bunx vitest run`
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

_(Record mistakes and lessons learned here)_
