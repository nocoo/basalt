# Publish-gate fixtures

Templates for 01 §5.3 gates A/B/C. Copy a directory to a tmp folder outside this
workspace, install a packed tarball of `@nocoo/basalt`, and run the consumer.
Do not use workspace aliases.

| Directory | Gate |
|-----------|------|
| `vite-tailwind` | A — Vite + Tailwind + `@source`, no standalone |
| `vite-standalone` | B — Vite without Tailwind, standalone CSS only |
| `next19` | C — Next on React 19, hydrate ThemeProvider + Button |
