# Publish-gate fixtures

## Gate B — Vite standalone

Command: `bun run consumer:standalone`

The command starts from a clean `@nocoo/basalt` package build, writes `npm pack` output into an OS temp directory outside this repository, copies `fixtures/vite-standalone`, injects the tarball as a `file:` dependency on that copy, then runs real `npm install` and a production Vite build.

Guarantees:

- The in-repo template does not declare `@nocoo/basalt`, `workspace:`, `link:`, or this repository's path.
- The consumer imports and renders `Button`, `ThemeProvider`, `ThemeToggle`, `Toast`, and `LinkProvider` from `@nocoo/basalt` root and only `@nocoo/basalt/styles/standalone`.
- Resolved `@nocoo/basalt` is the extracted tarball under that consumer's `node_modules`, not this workspace.
- `tailwindcss`, `recharts`, `react-day-picker`, and `@tanstack/react-table` are not installed.
- Production output includes HTML, JS, and CSS with `--basalt-background` and `.bg-basalt-primary`.
- Temp directories and tarballs are deleted on success and failure.
