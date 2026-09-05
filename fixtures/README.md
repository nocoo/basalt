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

## Gate C — Next + React 19 hydration

Command: `bun run consumer:next`

Browser prerequisite (root workspace only, never the temp consumer): pinned `playwright@1.62.1`. Install the matching Chromium with `bun run playwright:install`. The gate refuses `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` and does not fall back to a machine Chrome. If the pinned browser is missing, the failure names that install command.

`next19` is a React 19 consumer on Next 16.3.3. The shared kernel still does clean package build, OS-temp `npm pack`, fixture copy, `file:` tarball inject, real `npm install`, root/CSS resolve, and cleanup. This command additionally runs the consumer `typecheck`, `next build`, and one `next start` on a free `127.0.0.1` port. After HTTP GET `/` returns 200 and `basalt-next19-ok`, the same server is driven with Playwright Chromium: first screen, client hydration, Button state, ThemeToggle on `html`, exactly one visible `[data-sonner-toast]` inside the fixture-owned `[data-basalt-toast-host]` (mounted outside `[data-basalt-root]`, in-place rather than a React portal) whose `[data-title]` equals `basalt-toast-ok`, proof that toast node is in `document.body` and not contained by the app root, and an empty `console.error` / `pageerror` set. Ordinary host text, partial titles, hidden toasts, script text, and missing Sonner markers are not toast evidence.

Guarantees:

- The in-repo template does not declare `@nocoo/basalt`, `workspace:`, `link:`, Playwright, or this repository's path.
- Server `app/layout.tsx` only provides the HTML skeleton and `@nocoo/basalt/styles/standalone`.
- An explicit `"use client"` module imports `Button`, `ThemeProvider`, `ThemeToggle`, `Toast`, `toast`, and `LinkProvider` from the package root.
- Root and standalone CSS resolve inside that consumer's tarball copy.
- `tailwindcss`, `recharts`, `react-day-picker`, and `@tanstack/react-table` are not installed.
- Success and failure close the Playwright page/context/browser, delete the unique Chromium profile, stop the Next process, free the port, and delete the temp tree. Cleanup steps are nested so a profile assertion failure still stops the server and removes temp; proof and cleanup errors are aggregated rather than swallowed.
- Focused tests launch real Chromium to prove a `console.error` or `pageerror` fails the gate. A same-server regression starts one HTTP process, fails the browser proof, then uses the gate's outer cleanup path to prove PID, port, profile, and temp are gone without a second install or Next build.

## Gate D — optional heavy peers

Command: `bun run consumer:heavy`

`vite-heavy` is a React 19 consumer that installs the approved optional-peer versions and loads charts/DatePicker/DataTable from granular paths. The shared kernel still does clean package build, OS-temp `npm pack`, fixture copy, `file:` tarball inject, real `npm install`, root/CSS resolve, strict Bundler typecheck, production Vite build, and cleanup.

Guarantees:

- The in-repo template does not declare `@nocoo/basalt`, `workspace:`, `link:`, or this repository's path.
- Source granular-imports `DonutChart`, `DatePicker`, and `DataTable` only, plus `@nocoo/basalt/styles/standalone`. It does not import the package root or Tailwind.
- After install, `recharts` is `3.10.1`, `react-day-picker` is `10.0.1`, and `@tanstack/react-table` is `9.2.4`. `tailwindcss` is not installed.
- `import.meta.resolve` and dynamic `import()` of `@nocoo/basalt/charts/donut`, `components/date-picker`, and `components/data-table` land inside that consumer's tarball copy and expose the named exports.
- The published package declares those three libraries as optional peers (`^3` / `^10` / `^9`). DatePicker and DataTable are still self-contained; Gate D does not claim they call react-day-picker or TanStack Table.
- Production output includes HTML, JS, and standalone CSS with `--basalt-background`.
- Temp directories and tarballs are deleted on success and failure.
