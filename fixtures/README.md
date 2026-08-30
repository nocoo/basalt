# Publish-gate fixtures

## Gate A — Vite Tailwind

Command: `bun run consumer:tailwind`

Same shared consumer kernel as Gate B: clean package build, `npm pack` into an OS temp directory outside this repository, copy `fixtures/vite-tailwind`, inject the tarball as a `file:` dependency, real `npm install`, consumer `typecheck` (strict Bundler `tsc`, `noEmit`, `skipLibCheck: false`), then production Vite build.

Guarantees:

- The in-repo template does not declare `@nocoo/basalt`, `workspace:`, `link:`, or this repository's path.
- The consumer imports and renders `Button`, `ThemeProvider`, `ThemeToggle`, `Toast`, and `LinkProvider` from `@nocoo/basalt` root. `main.tsx` only imports local `./index.css`; `@nocoo/basalt/styles/tailwind` appears once, in that stylesheet.
- `@source` is the relative glob from `src/index.css` to the copied consumer's `node_modules/@nocoo/basalt/dist/**/*.{js,jsx,ts,tsx}`. Extra sources, path traversal, and lookalike prefixes fail the gate.
- After install, root and `styles/tailwind` resolve inside that consumer's tarball copy.
- `tailwindcss` and `@tailwindcss/vite` 4.3.3 are installed; `recharts`, `react-day-picker`, and `@tanstack/react-table` are not.
- Production CSS contains `--basalt-background` and Button utilities generated from the installed dist scan, not the standalone CSS dump.
- Temp directories and tarballs are deleted on success and failure.

## Gate B — Vite standalone

Command: `bun run consumer:standalone`

The command starts from a clean `@nocoo/basalt` package build, writes `npm pack` output into an OS temp directory outside this repository, copies `fixtures/vite-standalone`, injects the tarball as a `file:` dependency on that copy, then runs real `npm install`, the consumer `typecheck` script (strict Bundler `tsc`, `noEmit`, `skipLibCheck: false` against the installed tarball types), and a production Vite build.

Guarantees:

- The in-repo template does not declare `@nocoo/basalt`, `workspace:`, `link:`, or this repository's path.
- The consumer imports and renders `Button`, `ThemeProvider`, `ThemeToggle`, `Toast`, and `LinkProvider` from `@nocoo/basalt` root and only `@nocoo/basalt/styles/standalone`.
- After install, the consumer typechecks those root and CSS export specifiers with the tarball declarations; this is not the in-repo `packages/basalt` `types:check`.
- Resolved `@nocoo/basalt` is the extracted tarball under that consumer's `node_modules`, not this workspace.
- `tailwindcss`, `recharts`, `react-day-picker`, and `@tanstack/react-table` are not installed.
- Production output includes HTML, JS, and CSS with `--basalt-background` and `.bg-basalt-primary`.
- Temp directories and tarballs are deleted on success and failure.

## Gate C — Next + React 19 build/start

Command: `bun run consumer:next`

`next19` is a React 19 consumer on Next 16.3.3. The shared kernel still does clean package build, OS-temp `npm pack`, fixture copy, `file:` tarball inject, real `npm install`, root/CSS resolve, and cleanup. This command additionally runs the consumer `typecheck`, `next build`, and `next start` on a free `127.0.0.1` port, then HTTP GET `/` for status 200 and the `basalt-next19-ok` marker.

Guarantees:

- The in-repo template does not declare `@nocoo/basalt`, `workspace:`, `link:`, or this repository's path.
- Server `app/layout.tsx` only provides the HTML skeleton and `@nocoo/basalt/styles/standalone`.
- An explicit `"use client"` module imports and renders `Button`, `ThemeProvider`, `ThemeToggle`, `Toast`, and `LinkProvider` from the package root.
- Root and standalone CSS resolve inside that consumer's tarball copy.
- `tailwindcss`, `recharts`, `react-day-picker`, and `@tanstack/react-table` are not installed.
- The server is terminated and temp/tarball are deleted on success and failure.
- This gate does not claim browser hydration, console, or interaction checks.
