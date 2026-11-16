# Basalt application chrome

Design tokens, component categories, intrinsic sizing and motion rules are authoritative in [DESIGN.md](DESIGN.md). Follow that contract for library code and examples.

This is the one-pass setup for a Basalt app. An MVP is **login + shell + one page**. After that, product work is arranging `LayerCard` on the island. Do not invent a second header, a second rail, or a second title above the content heading.

The library owns the rail, the main column, collapse motion, the island, the page heading, and region rules. The app owns navigation data, brand, version, identity, and page bodies.

Package: `@nocoo/basalt`. React 19. Tailwind v4. Catalog: https://basaltui.com.

For complete, compilable AppFrame, Login, and Resources modules, read `node_modules/@nocoo/basalt/ai/RECIPES.md`. These application-owned recipes are built and exercised from the installed package in standalone, Tailwind, and Next.js consumers. Route, authentication, permissions, and transport remain application responsibilities.

---

## 1. MVP

Ship in this order. Each step has a section below. Do not skip ahead to cards.

1. **Providers + CSS** — §2–5
2. **Login** — full-viewport badge. No shell. §11
3. **App frame** — skip link, sidebar (product title + version + nav), header (crumbs + current page + top-right), island. §6–10
4. **First page** — `PageHeader` (title, subtitle, create, filters) then cards. Optional `SectionRule`. §13–15

### Who owns what

| Layer         | Component                | Owns                                                                          | Does not own                    |
| ------------- | ------------------------ | ----------------------------------------------------------------------------- | ------------------------------- |
| Landing       | public marketing route   | full-width sections and document scrolling                                    | dashboard width or scroll rules |
| Login         | app page, not `AppShell` | identity badge                                                                | rail, header, island            |
| Rail          | `Sidebar`                | product title, version pill, nav, user                                        | page body                       |
| Framework bar | `AppHeader`              | ancestor breadcrumbs, current page name, top-right actions (`ThemeToggle`, …) | create, filters, cards          |
| Island        | `ContentIsland`          | L1 surface and scroll                                                         | page chrome                     |
| Page heading  | `PageHeader`             | content title, subtitle, create last, filters                                 | `AppHeader` crumbs              |
| Region        | `SectionRule`            | dashed title rule, optional hint, optional region actions                     | `LayerCard.Header`              |
| Card          | `LayerCard`              | nested surface                                                                | page title                      |

### Tree

```
LandingPage                       ← / only. Document scroll, no AppShell.
LoginPage                         ← /login only. No AppShell.

AppShell                          ← dashboard and catalog routes
├── AppSkipLink
├── Sidebar                       ← product title + version + nav
└── AppMain                       ← id="main-content"
    ├── AppHeader                 ← crumbs + current page | top-right
    └── island wrap               ← px-basalt-space-lg pb-basalt-space-lg md:px-basalt-layout-sm md:pb-basalt-layout-sm
        └── ContentIsland
            ├── PageHeader        ← title + subtitle | create / short filters
            │                     ← optional own-row complex filters
            ├── SectionRule?      ← optional region split
            └── LayerCard…        ← all later product UI
```

`AppHeader.title` is the current page in the top bar (`h1`, `text-sm`). `PageHeader.title` is the content heading (`h1`, `text-2xl`). They may use the same words in regular workspaces. Mobile immersive layouts instead use one compact AppHeader and a desktop-only PageHeader wrapper; see §6. They are different roles. Do not put an icon + page name above `PageHeader` — that duplicates the bar.

The landing page and its prerendered HTML share `LandingContent`. Load the site stylesheet from `index.html` so it also works without JavaScript. Scope marketing CSS to `.landing` and crawl summaries to `[data-crawl-page]`; do not set global `header`, `main`, or `footer` dimensions. Keep document scrolling available on `html`, `body`, and `#root`. `AppShell` contains the dashboard viewport, and `ContentIsland` owns its independent scroll. Give both a positioning context (`relative`) so absolutely positioned content, including screen-reader labels, stays inside the correct scroll boundary.

Resolve the mobile breakpoint on the first client render. Do not briefly reserve a desktop sidebar on small screens; responsive charts would measure that narrow intermediate layout.

Prerender non-root routes as `route.html` (for example, `ui/button.html`). Cloudflare's `auto-trailing-slash` handling and Vite preview serve these at the extensionless canonical URL `/ui/button`; directory index files would imply a different trailing-slash URL.

Landing previews are real captures at a 1600 × 1000 viewport and 2× device scale, with 1200px variants selected through `srcset`; the hero uses a separate 390px mobile capture on narrow screens. The large corner-tower artwork derives from the original `logo.png`; its subtle perspective motion pauses outside the viewport, in background tabs, and for reduced motion. Device tilt is off by default on mobile. Only the explicit Enable tilt button requests motion permission and starts listening; ordinary touches never request access. Horizontal dragging remains available while preserving vertical page scrolling. Calibrate tilt to the current grip and screen orientation, and keep its movement bounded. The brand card uses one rounded clip around a single painted backdrop; avoid separate inner radii, outlines, or a divider touching its bottom edge.

The hero and elevated Forbidden City backgrounds each use a matched daylight/twilight pair. Generate each pair together on one 2880 × 2880 canvas, then crop at the exact horizontal midpoint into two 2880 × 1440 images. Preserve the same camera and scenery between themes. Native masters, references, prompts, and sanitized generation records live under `assets/landing/generated/`; `assets/landing/backgrounds.json` records the crop coordinates and export hashes.

The matte floating header uses an icon-only GitHub link and one light/dark theme button. Resolve the system preference until the visitor chooses a theme, then persist that explicit choice through the shared provider. The landing button switches from the currently resolved mode directly to its opposite.

When `AppHeader` already has breadcrumbs, **omit** `PageHeader.breadcrumbs`.

Live: `/login`, shell, first page `/data`, surfaces `/layout`. Catalog: `/ui/page-header`, `/ui/section-rule`.

---

## 2. Install and CSS

```bash
npm i @nocoo/basalt
```

### Option A: Vite + Tailwind CSS v4 Setup

Install Tailwind CSS v4 and the official Vite plugin:

```bash
npm i -D tailwindcss @tailwindcss/vite
```

Configure `vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), react()],
});
```

In the app stylesheet (e.g. `src/index.css`), import Basalt before Tailwind. Basalt embeds its own package source scan:

```css
@import "@nocoo/basalt/styles";
@import "tailwindcss";

@layer base {
	html,
	body,
	#root {
		height: 100%;
	}
	body {
		@apply bg-basalt-background text-basalt-foreground antialiased;
	}
}
```

Basalt registers `--basalt-*` tokens and `--color-basalt-*` utilities before Tailwind runs. Use those utilities. Do not add a second color system (`background`, `foreground`, `sidebar`, …) and do not re-declare `--basalt-*`.

### Option B: Standalone CSS (No Tailwind)

Without Tailwind, import `@nocoo/basalt/styles/standalone` in your application entrypoint instead:

```ts
import "@nocoo/basalt/styles/standalone";
```

Standalone packages design tokens, control surface utilities, animations, and scoped base resets (`.basalt-ui`) for controls (`box-sizing: border-box`, font inheritance, native button appearance, list resets, and table borders) without injecting global resets or full Tailwind preflight onto host elements; still set `html, body, #root { height: 100% }`.

### Theme Pre-Hydration

Apply theme on the document **before** React paints:

```ts
let stored: string | null = null;
try {
	stored = window.localStorage.getItem("theme");
} catch {
	// Continue with the system theme when browser storage is denied.
}
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isDark = stored === "dark" || (stored !== "light" && prefersDark);
document.documentElement.classList.toggle("dark", isDark);
document.documentElement.classList.toggle("light", !isDark);
document.documentElement.dataset.mode = isDark ? "dark" : "light";
```

---

## 3. Imports

Root barrel is small leaves and providers. Shell chrome is granular.

| From                                      | Import                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nocoo/basalt`                           | `Button`, `Input`, `LayerCard`, `DescriptionList`, `Sidebar`, `SidebarProvider`, `SidebarHeader`, `SidebarBrand`, `SidebarDrawer`, `SidebarToggle`, `SidebarNav`, `SidebarFooter`, `SidebarItem`, `SidebarIconItem`, `SidebarPartition`, `SidebarGroup`, `SidebarSearch`, `SidebarUser`, `ContentIsland`, `Sheet`, `SheetContent`, `SheetTitle`, `Avatar`, `AvatarFallback`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, `ThemeProvider`, `ThemeToggle`, `LinkProvider`, `Toaster`, `CommandPalette`, … |
| `@nocoo/basalt/components/app-shell`      | `AppShell`, `AppMain`, `AppSkipLink`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `@nocoo/basalt/components/app-header`     | `AppHeader`                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `@nocoo/basalt/components/page-header`    | `PageHeader`                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `@nocoo/basalt/components/section-rule`   | `SectionRule`                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `@nocoo/basalt/components/loading-screen` | `LoadingScreen`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `@nocoo/basalt/providers/theme`           | `useTheme` (if not taking `ThemeProvider` from the root)                                                                                                                                                                                                                                                                                                                                                                                                 |
| `@nocoo/basalt/components/chart`          | `ChartFrame`, legend, tooltip, palette and series utilities                                                                                                                                                                                                                                                                                                                                                                                              |
| `@nocoo/basalt/components/stat-card`      | `StatCard`, `StatGrid`                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `@nocoo/basalt/components/date-picker`    | DatePicker                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `@nocoo/basalt/components/data-table`     | DataTable                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `@nocoo/basalt/icons`                    | Icon exports from Lucide                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `@nocoo/basalt/primitives/*`             | Headless Radix primitive exports used by Basalt                                                                                                                                                                                                                                                                                                                                                                                                          |

Off the root barrel: `AppShell`, `AppMain`, `AppSkipLink`, `AppHeader`, `PageHeader`, `SectionRule`, `LoadingScreen`, chart chrome, DatePicker, DataTable. Import those from the granular paths above. `LayerCard` is on the root barrel **and** `@nocoo/basalt/components/layer-card`.

---

## 4. Provider tree

One tree for the whole app. Login and the shell both sit under it.

```tsx excerpt:app-provider-tree
<ThemeProvider>
	<LinkProvider render={AppLink}>
		<TooltipProvider>
			<BrowserRouter>
				<Toaster />
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route element={<AppFrame />}>{/* authenticated pages */}</Route>
				</Routes>
			</BrowserRouter>
		</TooltipProvider>
	</LinkProvider>
</ThemeProvider>;
```

`LinkProvider` `render` must map `href` to the app router (React Router `Link`, etc.). External `http(s):` / `mailto:` / `tel:` stay as `<a>`.

`TooltipProvider` is required for collapsed-rail tooltips.

### ThemeProvider Configuration

`ThemeProvider` manages color scheme mode (`"light" | "dark" | "system"`). It synchronizes active classes (`light`/`dark`) and attributes (`data-mode="dark"|"light"`) onto `document.documentElement`, supports cross-tab and same-page synchronization, and provides graceful fallback when storage is restricted.

| Prop              | Type                                                | Default      | Description                                                                                                                                                  |
| ----------------- | --------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children`        | `ReactNode`                                         | _(required)_ | Application components wrapped by the theme context.                                                                                                         |
| `storageKey`      | `string`                                            | `"theme"`    | Key used for `localStorage` persistence.                                                                                                                     |
| `defaultTheme`    | `BasaltTheme` (`"light"` \| `"dark"` \| `"system"`) | `"system"`   | Initial fallback theme during SSR or when no stored preference exists.                                                                                       |
| `persist`         | `boolean`                                           | `true`       | When `false`, completely isolates the provider from `localStorage` (never reads or writes storage, does not broadcast or listen to external storage events). |
| `theme`           | `BasaltTheme`                                       | `undefined`  | Controlled theme value. When supplied, internal state is driven by this prop.                                                                                |
| `onThemeChange`   | `(theme: BasaltTheme) => void`                      | `undefined`  | Callback fired when a theme change is requested. In controlled mode, callers update `theme`.                                                                 |
| `applyToDocument` | `boolean`                                           | `true`       | When `false`, disables mutating classes or dataset on `document.documentElement`, allowing a host theme system to manage root DOM state.                     |
- **Hook `useTheme()`**: Returns `{ theme: BasaltTheme, setTheme: (theme: BasaltTheme) => void }`. Throws an error when invoked outside a `ThemeProvider`.
- **Storage failure resilience**: If reading or writing `localStorage` throws (e.g. quota exceeded or sandboxed iframe security error), `ThemeProvider` catches the error, retains the explicit selection in memory, and suppresses stale bare storage events from rolling back state.
- **SSR & Hydration**: During SSR, `ThemeProvider` returns controlled `theme` (if provided) or `defaultTheme`. On the client, it hydrates from `localStorage` if `persist=true`. When custom `storageKey` or `defaultTheme` is configured, pre-hydration inline scripts must match the same key and default.
- **Host management**: Set `persist={false}` and `applyToDocument={false}` when nested inside an external theme system or embedded widget to prevent mutating the global document root or polluting host storage.

<a id="accent-provider"></a>

### AccentProvider and useAccent

`AccentProvider` manages dynamic primary accent color overrides (`--basalt-primary`, `--basalt-primary-foreground`, `--basalt-ring`, and `dataset.accent`). It also supplies twelve raw candy swatches (`--basalt-accent-1` through `--basalt-accent-12`). It does not alter chart palette tokens (`--basalt-chart-*`).

#### AccentProvider Configuration

| Prop               | Type                                                        | Default           | Description                                                                                                                        |
| ------------------ | ----------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `children`         | `ReactNode`                                                 | _(required)_      | Application components wrapped by the accent context.                                                                              |
| `storageKey`       | `string`                                                    | `"basalt-accent"` | Key used for `localStorage` persistence.                                                                                           |
| `defaultAccent`    | `string`                                                    | `"primary"`       | Initial accent swatch ID during SSR or when no stored preference exists.                                                           |
| `persist`          | `boolean`                                                   | `true`            | When `false`, isolates the provider from `localStorage` (no storage read/write, no cross-tab sync).                                |
| `accent`           | `string`                                                    | `undefined`       | Controlled accent value. When supplied, internal state is driven by this prop.                                                     |
| `onAccentChange`   | `(accent: string) => void`                                  | `undefined`       | Callback fired when an accent change is requested.                                                                                 |
| `applyToDocument`  | `boolean`                                                   | `true`            | When `false`, disables writing CSS custom properties and `data-accent` to `document.documentElement`.                              |
| `paletteOverrides` | `Readonly<Record<string, { light: string; dark: string }>>` | `undefined`       | Optional HSL-channel pairs for the twelve preset IDs. Invalid pairs and unknown IDs are ignored. The application owns persistence. |
- **Hook `useAccent()`**: Returns `{ accent: string, setAccent: (id: string) => void, swatches: readonly AccentSwatch[] }`. Throws an error when invoked outside an `AccentProvider`.
- **`AccentSwatch` Type**:
  - `id: string`: Unique swatch identifier (e.g., `"primary"`, `"teal"`, `"rose"`).
  - `label: string`: Human-readable swatch name.
  - `token: string`: CSS variable token binding (e.g., `"--basalt-accent-1"`).
  - `light: string`: HSL values applied in light mode (e.g., `"204 88% 62%"`).
  - `dark: string`: HSL values applied in dark mode (e.g., `"204 90% 70%"`).
- **Utilities**:
  - `ACCENT_SWATCHES`: Readonly array of 12 candy-inspired `AccentSwatch` objects: Blue, Ice, Bondi, Green, Lime, Yellow, Tangerine, Strawberry, Pink, Grape, Blueberry, and Pearl. The stable IDs are `primary`, `sky`, `teal`, `green`, `lime`, `amber`, `orange`, `red`, `rose`, `purple`, `indigo`, and `gray`. Use the provider hook for swatches with custom overrides applied.
  - `DEFAULT_ACCENT_ID`: Default accent ID (`"primary"`).
  - `accentSwatchById(id: string | null | undefined): AccentSwatch`: Finds a preset by `id`, mapping legacy IDs to their closest retained hue and defaulting to `ACCENT_SWATCHES[0]` if not found. For example, `jade` becomes `teal`, `magenta` becomes `rose`, and `gold` becomes `amber`; the full mapping is in `ai/COMPATIBILITY.md`.
  - `accentForeground(hsl: string)`: Compares WCAG contrast against white and dark text and returns the higher-contrast pairing (`"0 0% 10%"` or `"0 0% 100%"`). Note: selecting higher contrast does not guarantee arbitrary custom colors reach 4.5:1.
  - `applyAccent(id: string, dark = false): void`: Sets CSS variables `--basalt-primary`, `--basalt-primary-foreground`, `--basalt-ring`, and `dataset.accent` on the document root element. For built-in palette swatches, semantic `--basalt-primary` is derived to guarantee WCAG 4.5:1 text/button contrast across L0–L3 surfaces and 90% hover states without mutating the raw control swatches (`ACCENT_SWATCHES`) or chart palette tokens. This helper applies presets; use `paletteOverrides` on the provider for custom colors. Badge variants pair corresponding semantic foreground tokens (`text-basalt-badge-*-foreground` / `text-basalt-*-foreground`). Accepts optional `dark` flag (defaults to `false`).
- **Known Limitations & Resilience**: Storage access gracefully degrades in sandboxed or quota-exceeded environments by preserving in-memory choices without throwing. SSR hydration serves controlled `accent` (if provided) or server snapshot defaults (`DEFAULT_ACCENT_ID = "primary"`). Built-in palette accents satisfy WCAG 4.5:1 across surfaces in both themes.

### Control and chart palettes

Control swatches use candy finishes inspired by classic iMac and iPhone 5C colors. The raw swatch stays bright; semantic primary text and buttons derive a contrast-safe lightness for the current theme. A yellow swatch therefore produces darker primary text in light mode. Custom colors receive the same semantic treatment.

```tsx compile:integration-custom-palette
import { Button } from "@nocoo/basalt/components/button";
import { AccentProvider } from "@nocoo/basalt/providers/accent";

export function CustomBrand() {
	return (
		<AccentProvider
			defaultAccent="primary"
			persist={false}
			paletteOverrides={{ primary: { light: "204 88% 62%", dark: "204 90% 70%" } }}
		>
			<Button>Save changes</Button>
		</AccentProvider>
	);
}
```

The catalog's `/palette` editor saves twelve light/dark hex pairs in `localStorage` under `basalt-palette-v1`, separately from the selected ID in `basalt-accent`. Preferences survive reloads and navigation and synchronize across tabs on the same origin. Invalid data falls back to the classic palette; denied reads or writes keep the page usable, and failed saves explicitly report that the change lasts for the current session. Restore classic retains the custom draft for later reuse. This editor and storage format belong to the catalog application; consumers pass their own validated preferences through `paletteOverrides`.

Charts use a fixed **five-color** cycle: Blue, Pink, Green, Yellow, Gray. The first four colors use the exact classic control swatch values in each theme; gray retains its existing light/dark values. Marks use solid candy colors without contrasting outlines or shadows. Text continues to use semantic foreground tokens. `CHART_COLORS` and `getChartColor(index)` are independent of control accent selection and custom palettes. Use modulo indexing or `getChartColor` when a chart has more than five series, and use labels or an explicit `series.color` for distinctions beyond color. Existing `chart` keys and numbered chart CSS tokens remain aliases, but the former 24-color values and array length are intentionally replaced. Values heatmaps and Timeline rails also use fixed chart tokens. For tinted Timeline event rows, pass `textColor: "hsl(var(--basalt-foreground))"` with a translucent background utility; both title and subtitle inherit it. Gauge remainder uses `chartMuted`, a neutral track for the active theme; chart labels and tooltip text use semantic foreground tokens. See `ai/COMPATIBILITY.md` before migrating color-indexed code.

Raw candy fills can fall below 3:1 against light surfaces. Provide descriptive labels and `summary` / `dataAlternative` so values and relationships do not depend on color alone.

### Host-Controlled Preferences Recipe

When host applications (e.g. workspace shells, embedded previews, or multi-tenant panels) manage theme and accent state externally, both providers can run in controlled mode with `persist={false}` and `applyToDocument={false}`. The host application handles the actual root DOM classes, variables, or server cookies while child Basalt components consume standard contexts.

```tsx compile:integration-host-preferences
import { useState } from "react";
import { Button } from "@nocoo/basalt/components/button";
import { AccentProvider, useAccent } from "@nocoo/basalt/providers/accent";
import { type BasaltTheme, ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";

function PreferencesControls() {
	const { theme, setTheme } = useTheme();
	const { accent, setAccent } = useAccent();

	return (
		<div className="flex flex-wrap items-center gap-basalt-space-lg">
			<span className="text-sm font-medium">Theme: {theme}</span>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			>
				Toggle {theme === "dark" ? "Light" : "Dark"}
			</Button>
			<span className="text-sm font-medium ml-basalt-space-lg">Accent: {accent}</span>
			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					const next = accent === "rose" ? "sky" : "rose";
					setAccent(next);
				}}
			>
				Toggle Accent
			</Button>
		</div>
	);
}

export function HostPreferencesApp() {
	const [theme, setTheme] = useState<BasaltTheme>("light");
	const [accent, setAccent] = useState("rose");

	return (
		<ThemeProvider persist={false} applyToDocument={false} theme={theme} onThemeChange={setTheme}>
			<AccentProvider
				persist={false}
				applyToDocument={false}
				accent={accent}
				onAccentChange={setAccent}
			>
				<div className="p-basalt-space-lg border rounded-lg space-y-basalt-space-lg">
					<p className="text-xs text-basalt-muted-foreground">
						Host owns document root DOM and persistence. Basalt contexts operate safely without
						side-effects.
					</p>
					<PreferencesControls />
				</div>
			</AccentProvider>
		</ThemeProvider>
	);
}
```

---

## 5. Color and type

Every chrome class uses the `basalt-` prefix:

- surfaces: `bg-basalt-background` (L0), `bg-basalt-card` (L1 island), `bg-basalt-secondary` (L2 card), `bg-basalt-bright` (L3 well), `bg-basalt-control` (current-surface controls), `bg-basalt-primary`, `bg-basalt-accent`
- nest: see **§14**. `ContentIsland` / Dialog / Sheet / AlertDialog set `data-basalt-surface-root`. `LayerCard` and `LayerCard.Well` set `data-basalt-surface`. Do not hand-write `bg-card` wells.
- text: `text-basalt-foreground`, `text-basalt-muted-foreground`, `text-basalt-primary-foreground`
- line: `ring-basalt-border`, `border-basalt-border`

Icons: import from `@nocoo/basalt/icons`, use `strokeWidth={1.5}`, nav size `h-4 w-4 shrink-0`.

---

<a id="root-geometry"></a>
## 6. Root geometry

`AppShell` owns the viewport and safe area; `AppMain` and `ContentIsland` derive their scroll behavior from it. Choose deliberately:

| `layout`              | Below 768px                | 768px and above            |
| --------------------- | -------------------------- | -------------------------- |
| `workspace` (default) | Bounded panes              | Bounded panes              |
| `responsive`          | Natural document scrolling | Bounded panes              |
| `document`            | Natural document scrolling | Natural document scrolling |

Bounded shells use border-box `height/max-height: 100dvh`. Document shells use `min-height: 100dvh`, automatic height, visible overflow and ordinary root scrolling. Main and island release their height/overflow constraints together; no UA detection, innerHeight workaround, fixed reader viewport or nested mobile scroller is needed. Desktop workspaces keep the island as the vertical scroll owner.

### AppShell, AppMain, AppSkipLink API & Contracts

- **`AppShell`** accepts `layout?: "workspace" | "responsive" | "document"` and native div attributes. It is the sole safe-area owner of the normal document tree: CSS `env(safe-area-inset-*)` padding is included in its border-box. In document mode bottom padding is trailing content, never a fixed reserved strip. Do not subtract these insets again from main/island height.
- **`AppMain`** renders the main landmark with `id="main-content"` and `tabIndex={-1}` by default. Native main attributes may override these. It has `min-width: 0` and a flexible column layout; its height and overflow follow the shell.
- **`AppSkipLink`** points to `#main-content` unless `href` is supplied. Provide visible link text; keep it first in the shell.
- **`ContentIsland`** (from `components/sidebar`) accepts `mobileSurface?: "inset" | "edge-to-edge"` (default `inset`). Both are L1 surface roots. Edge-to-edge removes mobile padding, radius, ring and shadow; desktop padding/radius remain. The application supplies readable inner content padding, not another painted card.
- All four accept native attributes and `className`; they do not forward refs. Avoid overriding their height/overflow contract. Put specialized bounded desktop panes inside the island with `md:` constraints only.

```tsx excerpt:responsive-shell
<AppShell layout="responsive">
	<AppSkipLink>Skip to content</AppSkipLink>
	<AppMain>
		<AppHeader title="Field notes" actions={actions} />
		<div className="flex min-h-0 min-w-0 flex-1 flex-col md:px-basalt-layout-sm md:pb-basalt-layout-sm">
			<ContentIsland mobileSurface="edge-to-edge">
				<div className="mx-auto max-w-prose px-basalt-space-lg py-basalt-space-lg md:p-0">
					{content}
				</div>
			</ContentIsland>
		</div>
	</AppMain>
</AppShell>;
```

The wrapper intentionally has **no mobile `px-basalt-space-lg` / `pb-basalt-space-lg`**. ContentIsland cannot remove spacing owned by its parent. Remove consumer `h-screen`, `h-full`, `overflow-hidden`, fixed heights and body scroll locks from the document path; all intermediate wrappers must be natural-height columns. Do not target private descendants to undo the library.

The consumer owns `viewport` metadata: `width=device-width, initial-scale=1, viewport-fit=cover`. Do not disable zoom. The library never edits document metadata or body styles for layout. Floating modal navigation has a separate portal tree: `Sheet` or overlay `Sidebar` owns modal scroll locking/focus; the Sidebar within it remains bounded and applies that portal's safe-area padding once. Do not add a manual body overflow effect.

A desktop Sidebar stays bounded even beside a document: its own navigation may scroll, but the long main content belongs to the document. Hide the desktop rail on mobile and use the same navigation inside an expanded Sidebar in a Sheet. Do not mount duplicate focusable navigation. Single-column reading needs no Sidebar at all.

`AppHeader` adds `sticky?: boolean` (default false) and `density?: "comfortable" | "compact"` (default comfortable). Compact is 52px, with at least 44px controls inside the leading/actions slots (not breadcrumb/title links); comfortable remains 56px. `sticky` uses the current scroll owner and an opaque L1 background. Place it directly inside AppMain or as the first child of ContentIsland; do not put it in a short wrapper that limits its sticky travel. The shell exposes `--basalt-safe-top` and resolves `--basalt-sticky-top` to that inset for document scrolling, or zero for bounded panes. The sticky row offsets below the notch and paints the gap with a pseudo-element. Initial inset is still paid only once by the shell, not added again to header height. Do not add safe-area padding to the header. A bounded header outside the island is already stationary and does not need `sticky`.

**Single-header immersion is an explicit application layout.** On mobile, use one compact `AppHeader` with title, back/navigation and essential actions; omit the duplicated `PageHeader` (or put it in a `hidden md:block` wrapper). Keep the normal desktop PageHeader hierarchy for workspaces. Content section headings still belong in the document. Use existing DropdownMenu/Popover for secondary actions and 44px minimum touch targets; never invent reader-specific routing or actions in the library.

Copyable complete recipes: [mobile layouts](packages/basalt/ai/RECIPES.md#mobile-layouts). Live full-page examples: `/examples/reader`, `/examples/list-detail`, `/examples/workspace`. Desktop bounded panes, mobile root scrolling, form focus and modal restoration are separate checks. Automated WebKit checks CSS, scrolling and focus, **not physical iPhone Safari toolbar collapse or the software keyboard**; verify those manually on device.

---

## 7. Sidebar is the rail

`Sidebar` **is** the column. It already has:

- shell-derived bounded height (standalone `100dvh`), `flex-col`, `shrink-0`, sticky positioning at the shell-owned safe top
- expanded width **240px** (inline `width`)
- collapsed width **68px**
- collapse animation `transition-[width] duration-basalt-normal ease-basalt` (disabled for reduced motion)

Children of `Sidebar` are **regions only**: header, search, nav, footer. They fill that column. `SidebarNav` is `flex-1 min-h-0 overflow-y-auto`, so the footer stays at the bottom.

Do not wrap those regions in another full-viewport column. Do not set `h-screen`, `w-[240px]`, or `w-[68px]` on an inner element. Width and height stay on `Sidebar`.

### Shared navigation geometry

`SidebarNav` uses a 16px horizontal inset plus the row's 8px inset, placing row content on a 24px column with a 4px row gap. Sidebar groups do not add another horizontal inset. Sidebar destinations and search use 8px horizontal/vertical padding, an 8px icon gap and a 22px line box for a 38px reference row. Editable/folder rows, horizontal navigation links and menus retain 6px vertical padding and 34px rows. The header uses a 24px horizontal inset; the footer uses a token-derived 16px avatar inset plus 8px top and 16px bottom padding. Place `SidebarSearch` directly in `SidebarNav`; one instance switches between the filled row and collapsed icon form.

Use `SidebarNav` for vertical lists, including standalone lists of `EditableNavItem` / `FolderNavItem`. It composes the existing list-local hover adapter. One background moves with transform between enabled rows. Sidebar hover appears at the actual pointer row and disappears there on leave or over a gap/disclosure label; it never launches from or returns to the active route or stale pointer focus. Only continuous row-to-row hover animates. Keyboard focus remains independent. Nested lists own separate highlights. Hidden, disabled and actively renamed rows are excluded. Geometry reads are batched per animation frame, same-row pointer motion causes no updates, and reduced motion disables transitions. Navigation state, routes and rename operations remain application-owned; the adapter is View-only.

Place `SidebarBrand` in `SidebarHeader` with a 24px mark and `SidebarToggle` in its action slot. The fixed mark slot starts at 22px and ends at 46px, keeping its center on the 34px rail axis throughout the width transition. Pass the version as plain text: `SidebarBrand` renders it as a secondary badge (version pill) in the 12px auxiliary tier. It comes from the app `package.json` at build time. On a collapsed rail that is not peeking, the product name and version hide through `[data-basalt-sidebar][data-collapsed]` on `[data-slot="sidebar-brand-copy"]`; the mark slot stays visible. `SidebarPartition` aligns with row text. `SidebarGroup` adds only section spacing, never a second item gutter.

```tsx excerpt:sidebar-expanded-structure
<SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
	<Sidebar>
		<SidebarHeader>
			<SidebarBrand
				logo={<span aria-hidden="true">B</span>}
				name="Acme"
				version={`v${version}`}
				action={<SidebarToggle />}
			/>
		</SidebarHeader>
		<SidebarNav>
			<SidebarSearch onClick={() => setSearchOpen(true)}>Search</SidebarSearch>
			{groups.map((group) => (
				<div key={group.label}>
					<SidebarPartition>{group.label}</SidebarPartition>
					<div className="flex flex-col gap-basalt-nav-gap">
						{group.items.map((item) => (
							<SidebarItem key={item.href} active={active(item.href)} href={item.href}>
								<item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
								<span className="flex-1 truncate text-left">{item.label}</span>
							</SidebarItem>
						))}
					</div>
				</div>
			))}
		</SidebarNav>
		<SidebarFooter>
			<SidebarUser name={name} email={email} avatar={avatar} />
		</SidebarFooter>
	</Sidebar>
</SidebarProvider>;
```

SidebarPartition marks a major section; SidebarGroup is a smaller uppercase, semibold disclosure label with a 22px line box, 8px insets and 12px group separation. Group labels do not participate in the destination hover layer. Do not restyle them as ordinary SidebarItem rows or add per-page indentation repairs.

### Collapsed tree

Control `collapsed` through `SidebarProvider`. The element becomes 68px. Children are icon-sized and centered. Still no inner width/height wrapper.

The 68px rail uses `--basalt-size-rail`. `SidebarBrand` keeps the mark stationary at the 24px `--basalt-size-sidebar-logo` size, centered on the rail axis (pass an `img`/`svg`, optionally wrapped in one link, without size classes), and moves its action below the header, where a `SidebarToggle` takes the same 34×38px row box as `SidebarSearch` and `SidebarIconItem`; the footer remains left-aligned with the avatar fixed 16px from the rail edge. `SidebarSearch` and `SidebarIconItem` keep the 34px control width and 20px sidebar icon size, and derive their 38px minimum height from the sidebar line box and padding. The navigation region centers icon rows on that same rail axis without caller margin overrides. `SidebarSearch` automatically exposes its collapsed tooltip and accessible name; keep the same instance in both states. `SidebarUser` does the same for the footer: on a collapsed, non-peeking rail it renders only its `avatar` (in the same position as the expanded row) with a right-side tooltip showing `tooltip` (default `name`), and hides `email` and `action`. Render one `SidebarUser` in both states; do not branch on `collapsed` or hand-write an avatar tooltip. For signing out, pass `onSignOut` (button) or `signOutHref` (link, e.g. an Access logout URL) with an optional `signOutLabel` (default "Sign out"): the expanded row then ends with the standard muted LogOut icon button and a top tooltip, and the collapsed rail hides it with the other row content. Do not hand-write a sign-out button in `action`.

```tsx excerpt:sidebar-collapsed-structure
<SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
	<Sidebar>
		<SidebarHeader>
			<SidebarBrand
				logo={<span aria-hidden="true">B</span>}
				name="Acme"
				version={`v${version}`}
				action={<SidebarToggle />}
			/>
		</SidebarHeader>
		<SidebarNav>
			<SidebarSearch onClick={() => setSearchOpen(true)}>Search</SidebarSearch>
			{items.map((item) => (
				<Tooltip key={item.href} delayDuration={0}>
					<TooltipTrigger asChild>
						<SidebarIconItem active={active(item.href)} aria-label={item.label} href={item.href}>
							<item.icon className="h-4 w-4" strokeWidth={1.5} />
						</SidebarIconItem>
					</TooltipTrigger>
					<TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
				</Tooltip>
			))}
		</SidebarNav>
		<SidebarFooter>
			<SidebarUser name={name} email={email} avatar={avatar} />
		</SidebarFooter>
	</Sidebar>
</SidebarProvider>;
```

Render expanded **or** collapsed navigation from the same `collapsed` flag when item labels need separate representations. Keep one `Sidebar` and one `SidebarSearch`; the provider controls the search form, width and animation.

Portaled UI (`CommandPalette`, dialogs) may be a sibling of these regions inside `Sidebar`. They leave the document via a portal and do not participate in the column.

---

## 8. Collapse, peek, overlay

Standard product shell: pass React state `collapsed` and `onCollapsedChange` to `SidebarProvider`; `SidebarToggle` updates that state. Motion is already on `Sidebar`. The provider also supports peek-on-hover, overlay mode and resize. Set `resizable={false}` on a Sidebar inside a fixed-width Sheet.

Inside a mobile `Sheet` that hosts the sidebar, use `<SidebarToggle mode="dismiss" onDismiss={() => setOpen(false)} dismissLabel="Close navigation" />` in the `SidebarBrand` action slot. Dismiss mode keeps the same 28px icon button and `data-slot="sidebar-toggle"`, never changes the collapsed state, does not need a `SidebarProvider` and renders no tooltip, so a drawer that auto-focuses it still closes on the first Escape.

---

## 9. Mobile

Breakpoint: `768px`. Below that, the in-flow rail is omitted. Host the same sidebar tree in `SidebarDrawer`, which owns the left `Sheet`, standard sidebar width (`--basalt-size-sidebar-width`, aligned with `SidebarProvider`’s default via `SIDEBAR_DEFAULT_WIDTH_PX`), zero padding/border overrides, sr-only title/description, a forced-expanded inner `SidebarProvider` at that default width (no width override prop), optional `returnFocusRef`, and an `id` for `aria-controls`.

```tsx excerpt:mobile-sidebar-drawer
<SidebarDrawer
	open={mobileOpen}
	onOpenChange={setMobileOpen}
	id={mobileSheetId}
	returnFocusRef={mobileTriggerRef}
>
	<AppSidebar resizable={false} onToggle={() => setMobileOpen(false)} />
</SidebarDrawer>;
```

Pass `resizable={false}` on the inner `Sidebar`. Put `<SidebarToggle mode="dismiss" onDismiss={() => setMobileOpen(false)} />` in the `SidebarBrand` action slot (see §8). Close the drawer on pathname change.

**Migration from a hand-written `Sheet`:** replace the outer `Sheet`, padded `SheetContent`, sr-only `SheetTitle`/`SheetDescription`, and inner `SidebarProvider collapsed={false}` with one `SidebarDrawer`; drop `className` width/padding/border overrides and move `onCloseAutoFocus` focus restore to `returnFocusRef`.

`SidebarDrawer` bounds its sidebar to the available height. The drawer owns the sidebar-width column and the portal safe area. Radix Sheet owns modal scroll locking; do not set body overflow separately.

Sheets slide from their declared edge in 350ms and return in 250ms, while the backdrop fades and blurs to 6px. DropdownMenu, Select, ContextMenu, Popover, HoverCard and Tooltip scale from their trigger origin and fade in/out in 200/150ms. Shared motion tokens live in the package stylesheet; both CSS entrypoints include them. Reduced motion disables these animations. Keep content mounted through Radix's closing state; do not conditionally remove the root before its exit completes.

`AppHeader` `leading` is the menu button on mobile only: render `AppHeaderMenuButton` (a `HeaderAction` with the `Menu` glyph, default label "Open navigation", forwarded ref). Keep its ref for focus restore, or use it as `SheetTrigger asChild`. Inside the drawer, close with `SidebarToggle mode="dismiss"`. With `density="compact"`, compact header controls have a 44px minimum target.

Header actions use a stable hand cursor and compact 12px `TooltipContent`. `Button`, `LinkButton`, `Toggle`, and `ToggleGroupItem` keep their full rectangular pointer target with a transparent `::before`, including rounded corners. Wrap the actual button or link in `TooltipTrigger asChild` so the trigger retains one focusable hit target. `Toggle` and `ToggleGroupItem` selection styling follows `aria-pressed` / `aria-checked`, independently of the tooltip's `data-state`. Icon-only links must include a screen-reader label inside the link as well as an accessible name.

Local hook (not in the package):

```tsx excerpt:use-is-mobile-hook
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
```

---

## 10. Frame component

```tsx excerpt:app-frame-component
export function AppFrame() {
	const [collapsed, setCollapsed] = useState(false);
	const isMobile = useIsMobile();
	const [mobileOpen, setMobileOpen] = useState(false);
	const mobileTriggerRef = useRef<HTMLButtonElement>(null);
	const location = useLocation();
	const crumbs = [{ href: "/", label: "Home" }];
	const title = "Projects";

	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	return (
		<AppShell>
			<AppSkipLink>Skip to main content</AppSkipLink>
			{!isMobile ? (
				<AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
			) : (
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetContent
						side="left"
						tabIndex={-1}
						className="w-[var(--basalt-size-sidebar-width)] max-w-[var(--basalt-size-sidebar-width)] border-0 bg-basalt-background p-0"
						onOpenAutoFocus={(event) => {
							if (event.target instanceof HTMLElement) {
								event.preventDefault();
								event.target.focus();
							}
						}}
						onCloseAutoFocus={(event) => {
							if (mobileTriggerRef.current) {
								event.preventDefault();
								mobileTriggerRef.current.focus();
							}
						}}
					>
						<SheetTitle className="sr-only">Navigation</SheetTitle>
						<AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} resizable={false} />
					</SheetContent>
				</Sheet>
			)}
			<AppMain>
				<AppHeader
					leading={
						isMobile ? (
							<AppHeaderMenuButton ref={mobileTriggerRef} onClick={() => setMobileOpen(true)} />
						) : null
					}
					breadcrumbs={crumbs}
					title={title}
					actions={
						<>
							<ProjectLinks github="nocoo/acme" hexly="acme" name="Acme" />
							<ThemeToggle />
						</>
					}
				/>
				<div className="flex min-h-0 flex-1 flex-col px-basalt-space-lg pb-basalt-space-lg md:px-basalt-layout-sm md:pb-basalt-layout-sm">
					<ContentIsland>
						<Outlet />
					</ContentIsland>
				</div>
			</AppMain>
		</AppShell>
	);
}
```

<a id="appheader-and-breadcrumbs"></a>

`AppHeader` defaults to `h-14`, matching `SidebarHeader`; `density="compact"` uses a 52px row with 44px minimum targets. Its horizontal inset is 8px on mobile and 12px from 768px, aligning with the outer ContentIsland wrapper rather than the island's inner card edge. `sticky` keeps it visible within the current scroll owner; see §6 for safe-area positioning.

### AppHeader API & Contracts

`AppHeader` inherits root `header` attributes (`HTMLAttributes<HTMLElement>`).

- **`title?: string`**: Current page title rendered inside an `h1` (`truncate text-sm font-normal text-basalt-foreground`). (Source type intersection is `HTMLAttributes<HTMLElement> & { title?: ReactNode }`, which narrows valid `title` values to `string | undefined`). Do not also put the current page title in `breadcrumbs`.
- **`breadcrumbs?: { href?: string; label: ReactNode }[]`**: Breadcrumb hierarchy separated by ChevronRight. Supply ancestors with `title`, or a complete path ending in a nonlinked current item and omit `title`. No trailing separator is rendered without a title.
- **`breadcrumbsLabel?: string`**: Accessible name of the breadcrumb `nav` landmark (default "Breadcrumb"); pass the localized name, e.g. `"面包屑导航"`. Standalone `Breadcrumbs` takes the same value as `aria-label`.
- **`leading?: ReactNode`**: Optional slot before breadcrumbs, typically the mobile hamburger drawer trigger.
- **`actions?: ReactNode`**: Top-right framework controls (`ThemeToggle`, account dropdown, etc.). This slot is reserved for framework controls, **not** the page-level create button.

`ThemeToggle` is a `HeaderAction`: it cycles system → light → dark → system, shows the current theme's icon and names the **next** theme in its accessible name and bottom tooltip. `labels?: { light?, dark?, system? }` localizes those names (defaults "Switch to light theme", "Switch to dark theme", "Use system theme"); `tooltip={false}` hides the tooltip; `aria-label` pins a fixed accessible name. Do not wrap it in another tooltip or build a local theme toggle for labels.
- **Native & Ref Boundary**: Inherits native `HTMLAttributes<HTMLElement>`, but does not forward ref.

### HeaderAction

Every top-right icon control in `AppHeader.actions` is a `HeaderAction` (`@nocoo/basalt/components/app-header`): a 34px ghost icon button with an 18px muted glyph that turns to the foreground color on hover. `label` is both the accessible name and the tooltip shown 6px below the action. Do not hand-write a `HeaderTooltip` wrapper, size classes or color overrides.

- **`label: string`**: Accessible name and default tooltip.
- **`children`**: The icon (lucide icon or inline `svg` with `aria-hidden`).
- **`tooltip?: ReactNode | false`**: Tooltip content (default `label`); `false` renders none.
- **`href?: string`**: Renders a link instead of a button. External by default: `external` (default `true`) adds `target="_blank"`, `rel="noopener noreferrer"` and appends `newTabLabel` (default `"(opens in a new tab)"`) to the accessible name; a screen-reader copy of `label` is always inside the link.
- Other props go to the underlying `button` (or `a`). It forwards its ref and carries its own `TooltipProvider`, so it works directly as a `SheetTrigger asChild` or `DropdownMenuTrigger asChild` child.

**Project links.** `GitHubLink` (`repo`: `owner/name` or URL; `label` default "GitHub repository") and `HexlyLink` (`project`: hexly.ai slug; `name` for the default label "`<name>` on hexly.ai") are `HeaderAction` links with the brand glyphs built in. `ProjectLinks` renders the standard pair in order, GitHub then hexly, and omits whichever prop is missing: `<ProjectLinks github="nocoo/surety" hexly="surety" name="Surety" />`. Place it directly before `ThemeToggle`. Pass `githubLabel`, `hexlyLabel` and `newTabLabel` to localize. Do not copy the svg paths or `HexlyLink` helpers into the app.

```tsx excerpt:header-action
<AppHeader
	breadcrumbs={crumbs}
	actions={
		<>
			<HeaderAction label="Notifications" onClick={openInbox}>
				<Bell aria-hidden="true" strokeWidth={1.5} />
			</HeaderAction>
			<ThemeToggle />
		</>
	}
/>;
```

Product title and version live in `SidebarHeader`, not in `AppHeader`. Read the version from the app `package.json` at build time. Do not hardcode it.

---

## 11. Login — badge card

Login is **not** inside `AppShell`. It is a centered badge on the full viewport.

Shape: a fixed badge width, `rounded-basalt-lg`, `bg-basalt-card` and a hairline ring. Three bands: the primary strip on top, the body holding the mark and actions, and the status footer at the bottom. The body grows with its content, so a sign-in form fits without a fixed aspect ratio.

```tsx excerpt:login-badge-page
export function LoginPage() {
	return (
		<div className="basalt-ui relative flex min-h-dvh items-center justify-center bg-basalt-background p-basalt-space-lg">
			<div
				data-basalt-surface-root=""
				className="flex w-72 max-w-full flex-col overflow-hidden rounded-basalt-lg bg-basalt-card ring-1 ring-basalt-border"
			>
				<div className="flex items-center justify-between gap-basalt-space-lg bg-basalt-primary px-basalt-space-lg py-basalt-space-lg">
					<span className="text-basalt-base font-semibold text-basalt-primary-foreground">
						Acme
					</span>
					<span className="text-basalt-xs font-medium uppercase tracking-widest text-basalt-primary-foreground/80">
						Visitor
					</span>
				</div>
				<div className="flex flex-1 flex-col items-center gap-basalt-space-lg px-basalt-space-lg py-basalt-space-lg">
					<p className="text-basalt-xl font-semibold text-basalt-foreground">Welcome</p>
					<p className="text-basalt-sm text-basalt-muted-foreground">Sign in to continue</p>
					<Button className="w-full">Continue</Button>
				</div>
				<div className="border-t border-basalt-border px-basalt-space-lg py-basalt-space-lg">
					<p className="text-basalt-xs text-basalt-muted-foreground">Secure sign-in</p>
				</div>
			</div>
		</div>
	);
}
```

Swap the primary action for the real identity provider. Keep the badge proportions and the three bands (primary header, body, status footer).

---

<a id="loading"></a>

## 12. Loading

Boot and route gates use `LoadingScreen` — a centered mark and a 6rem shimmer bar on `bg-basalt-background`. It is a full-viewport status, not a child of the island.

### LoadingScreen API & Contracts

- **`label?: string`**: Accessible status name on `aria-label` (default: `"Loading"`). Root element carries `role="status"`.
- **`mark?: ReactNode`**: Centered brand mark slot. Defaults to no mark; applications provide any brand node through `mark`. Note: passing children to `LoadingScreen` does not override this mark slot; custom brand icons must be provided via the `mark` prop.
- **Native & Ref Boundary**: Inherits standard `HTMLAttributes<HTMLDivElement>`. Overlays full viewport (`fixed inset-0 z-50 flex items-center justify-center bg-basalt-background`). Does not forward ref.

```tsx excerpt:loading-screen-snippet
<LoadingScreen label="Loading" />;
```

---

## 13. First page

When skip link, rail (260 / 68, 300ms), header `h-14`, and island are in place, add routes as `Outlet` pages. Regular application pages inside the island start with `PageHeader`. Mobile immersive layouts may use a single `AppHeader` instead, with `PageHeader` shown only on desktop; see the root geometry contract. The shell file does not grow with page UI.

Standalone login, loading, error, and landing pages use their own first-screen structure: `/login` preserves the visitor-badge composition, `/loading` is a named loading status, and `/404` and `/static-page` have independent headings. These are deliberate layout exceptions, not alternate application-page templates. Library reference pages, category overviews and source viewers are normal island pages: they use the same heading template, with document sections below it.

The showcase's routes under `DashboardLayout` use the app-local `ShowcasePage`: one PageHeader and a shared section gap, with no repeated island padding, painted shell or nested main/viewport. Every catalog route keeps that shared scale: 30px titles and 24px page and document-section separation, whether it is an application page, a library index, a category guide, documentation or a source viewer. Catalog pages do not override the shared scale or its document rhythm; `PageHeader` keeps its `size` choices for consumers, where dashboards select `size="lg"` for 30px titles and ordinary application pages keep the `md` default. Header height follows content, never a scenic banner or negative inset. The original logo remains in navigation; mountain artwork belongs only to the independent landing. See [DESIGN.md](DESIGN.md#page-composition).

The catalog's app-local `RouteScrollReset` wraps each leaf page inside its Suspense boundary. Once the route content is committed, a changed pathname resets ContentIsland and document scrolling immediately, including Back/Forward navigation. Valid URL fragments instead use the chapter anchor with the measured sticky-directory inset. Same-page query changes and local controls preserve scroll. The shared sidebar is not remounted or scrolled. Routing policy belongs to the app, never to the Basalt package.

The `/forms`, `/settings`, and `/data` examples demonstrate local state and simulated requests, including failure/retry and cancellation. Their viewmodels own data and timers; Views own native FormData, focus, and responsive layout. Replace the local service adapter when integrating a backend. Theme selection uses the shared provider; local profile and upload changes do not update a real account.

`PageHeader` is flush on `ContentIsland`. The island owns 16px mobile insets, 24px tablet insets, and 32px horizontal / 24px vertical desktop insets. `AppHeader` remains aligned to the outer island boundary (8px mobile, 12px from 768px), not this inner content edge. Do not wrap the header in another card or add page padding. `PageHeader.size` is `"md" | "lg" | "xl"` (default `"md"`); larger headings use 16/24px descriptions, all title/description pairs use an 8px gap. `SectionRule variant="heading"` gives reading sections a 20px sentence-case title without the compact dashed rule. Controls and card slots keep their compact geometry.

### Create and filters

- Put the create button last in `actions`.
- One short filter (search, a single select) stays in `actions`, before create.
- Two or more filters, or a filter bar, go in `filters` (own row). Create stays in `actions`.
- If the filter set is large (search plus several segments), keep it **off** `PageHeader.filters`. Put a Filters control in `actions` and reveal the controls below the heading, on the island, with no divider. Open the panel when the URL already has filters.
- Do not put create in `filters`.
- Do not pass `breadcrumbs` here if `AppHeader` already has the trail.

### Short filters (same row as create)

```tsx compile:integration-projects-page-basic
import { Button } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PageHeader } from "@nocoo/basalt/components/page-header";

export default function ProjectsPage() {
	return (
		<div className="space-y-basalt-layout-lg">
			<PageHeader
				title="Projects"
				description="Active work in this workspace."
				actions={
					<>
						<Input placeholder="Search" className="max-w-48" />
						<Button>New project</Button>
					</>
				}
			/>
			<LayerCard>
				<p className="text-sm text-basalt-muted-foreground">List or board.</p>
			</LayerCard>
		</div>
	);
}
```

### Complex filters (own row) and regions

```tsx compile:integration-projects-page-full
import { Button } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { SectionRule } from "@nocoo/basalt/components/section-rule";

export default function ProjectsPage() {
	return (
		<div className="space-y-basalt-layout-lg">
			<PageHeader
				title="Projects"
				description="Active work in this workspace."
				actions={
					<>
						<Button variant="outline">Export</Button>
						<Button>New project</Button>
					</>
				}
				filters={
					<>
						<Input placeholder="Owner" className="max-w-48" />
						<Input placeholder="Region" className="max-w-48" />
						<Input placeholder="Risk" className="max-w-48" />
					</>
				}
			/>
			<SectionRule title="Overview" hint="Live totals for the current workspace.">
				<div className="grid grid-cols-2 gap-basalt-layout">
					<LayerCard>
						<p className="text-xs text-basalt-muted-foreground">Projects</p>
						<p className="text-2xl font-semibold">24</p>
					</LayerCard>
					<LayerCard>
						<p className="text-xs text-basalt-muted-foreground">Ready</p>
						<p className="text-2xl font-semibold">18</p>
					</LayerCard>
				</div>
			</SectionRule>
			<SectionRule
				title="Catalog"
				actions={
					<Button variant="outline" size="sm">
						Filter
					</Button>
				}
			>
				<LayerCard>
					<LayerCard.Header>Items</LayerCard.Header>
					<LayerCard.Body>
						<p className="text-sm text-basalt-muted-foreground">
							Later work is only more cards in this region.
						</p>
					</LayerCard.Body>
				</LayerCard>
			</SectionRule>
		</div>
	);
}
```

After this page exists, stop adding chrome. New features are `LayerCard` (and leaves inside them) under `PageHeader` / `SectionRule`. Keep view-models free of layout.

`PageHeader` and `SectionRule` are not on the root barrel. Live recipe: `/data`. Surfaces: `/layout`.

---

## 14. Nested surfaces

Pages render **inside** `ContentIsland`. That island is already L1. Paint is CSS descendant count. No React context. No `useSurface`.

### Levels

| Where   | Mark                                                     | Paint                                 |
| ------- | -------------------------------------------------------- | ------------------------------------- |
| L0      | `AppShell`, login viewport                               | `--basalt-background` 94% / 9%        |
| L1      | `ContentIsland`, Dialog, Sheet, AlertDialog, login badge | `--basalt-card` 97% / 10.6%           |
| L2      | first `LayerCard` under a root                           | `--basalt-secondary` 99% / 12.2%      |
| L3      | `LayerCard.Well` or a nested `LayerCard`                 | `--basalt-bright` 100% / 14%          |
| L3+     | deeper nested surface                                    | transparent, no ring by default       |
| Overlay | Tooltip, Popover, Dropdown, HoverCard                    | `--basalt-popover` — not a stack step |

`--basalt-muted` is not a content step. Isolated (no root): the outermost `LayerCard` paints as L1; its Well is L2.

`LayerCard.Primary` is `Well`. `LayerCard.Secondary` is `Header`. Keep the names; teach Header / Body / Well.

### Recipe

Unstructured card (KPI, metric, tile) — root padding, one surface:

```tsx excerpt:layercard-unstructured
<LayerCard>
	<p className="text-xs text-basalt-muted-foreground">Sessions</p>
	<p className="text-2xl font-semibold">1,284</p>
</LayerCard>;
```

Structured card — root padding drops. `Body` stays on L2. `Well` raises to L3:

```tsx excerpt:layercard-structured-body
<LayerCard>
	<LayerCard.Header>Account</LayerCard.Header>
	<LayerCard.Body>
		<DescriptionList columns={1}>
			<DescriptionList.Item term="Status">Active</DescriptionList.Item>
		</DescriptionList>
	</LayerCard.Body>
</LayerCard>;
```

```tsx excerpt:layercard-structured-well
<LayerCard>
	<LayerCard.Header>Activity</LayerCard.Header>
	<LayerCard.Well>{/* lists, nested groups, inner frames */}</LayerCard.Well>
</LayerCard>;
```

Place cards with Grid or flex. Those classes do not paint. A grid of `LayerCard` on the island is L2. A `LayerCard` inside a Well is L3+.

`outlined` draws a hairline when a transparent L3+ nest would otherwise vanish. Default grouping is luminance only.

### Controls and tables

Input, Select, secondary / outline Button use `bg-basalt-control` (`--basalt-control-fill` from the current surface) plus border. Do not override with `bg-card`, `bg-basalt-card`, or `bg-basalt-background`.

`Table` sets `data-basalt-table`. Zebra, hover, and selected paint on `td`, from `--basalt-zebra-fill`, `--basalt-hover` and `--basalt-selected`. Selection adds no decorative side bar or frame; semantic add/remove diff tints are preserved.

Neutral selected states use the brighter `--basalt-selected` surface, readable `--basalt-selected-foreground` and navigation font weight, without decorative side bars or selected borders. Never use `accent` or `muted` to signal selection. Existing semantic checkmarks and tab underlines remain; do not add a decorative frame at the white ceiling. A moving hover layer must not erase the selected row. Sidebar and editable navigation share this behavior and inset keyboard focus; neutral Button variants also honor `aria-pressed` and `aria-current`. Focus is separate from selection: ordinary targets use the 1px theme `--basalt-ring` stroke with a 2px outer offset; flush targets use the same stroke inset with a 2px negative offset. External focus targets need at least 4px clearance inside their nearest clipping container; existing 4px padding counts and is not stacked. Focus does not shift layout, error indicators stay independent, and forced-colors mode may use a 2px system outline. Segments and tabs retain their existing measured indicator motion. Primary/destructive actions, check/radio/switch glyphs and semantic diffs keep their semantic colors. See [DESIGN.md](DESIGN.md#selection-and-navigation-hierarchy).

`DescriptionList` is layout and type only. It is not a surface.

### Overlays

Dialog, AlertDialog, and Sheet portal to `body` and start a **new** L1 root. Do not nest `data-basalt-surface-root` in the same tree.

Popover, Tooltip, Dropdown, and HoverCard stay on the popover token. They do not open the stack.

### Don't

- Hand-write `bg-card` / `bg-muted` / `bg-secondary` wells inside the island
- Mark page roots with `data-basalt-surface-root` — the island already did
- Put `h-screen`, side padding, or a second card around `ContentIsland`
- Mix leftover `standalone.css` with the Tailwind contract

### Import

```ts
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
```

`LayerCard` and `DescriptionList` are also on the root barrel. Chrome (`AppShell`, `AppHeader`, `PageHeader`, `SectionRule`) is not.

---

## 15. PageHeader and SectionRule

`PageHeader` and `SectionRule` provide regular page-level chrome inside the island. A mobile immersive composition may use a single sticky AppHeader inside the island instead (§6). Import them from granular paths. They are not on the root barrel. Do not wrap the title in an island.

### PageHeader

Flush heading. Title left. Create last in `actions`. Short filters in `actions`. Complex filters on `filters`.

`breadcrumbs` is optional. Use it only when there is no `AppHeader` trail (catalog demos, isolated surfaces). Product pages under `AppFrame` omit it.

```tsx excerpt:page-header-snippet
import { PageHeader } from "@nocoo/basalt/components/page-header";

<PageHeader
	title="Projects"
	description="Active work in this workspace."
	actions={
		<>
			<Button variant="outline">Export</Button>
			<Button>New project</Button>
		</>
	}
	filters={<Input placeholder="Owner" className="max-w-48" />}
/>;
```

### SectionRule

Title, optional info control, dashed rule, optional actions. Children sit under the rule. Card titles stay on `LayerCard.Header`.

```tsx excerpt:section-rule-snippets
import { SectionRule } from "@nocoo/basalt/components/section-rule";

<SectionRule title="Catalog">
  <LayerCard>…</LayerCard>
</SectionRule>

<SectionRule title="Catalog" hint="Published items in this workspace.">
  <LayerCard>…</LayerCard>
</SectionRule>

<SectionRule
  title="Activity"
  hint="Events from the last 24 hours."
  actions={
    <>
      <Button variant="outline" size="sm">Export</Button>
      <Button size="sm">Refresh</Button>
    </>
  }
>
  <LayerCard>…</LayerCard>
</SectionRule>
```

Stack one `SectionRule` per region. Live recipe: `/layout`. Catalog: `/ui/page-header`, `/ui/section-rule`.

---

## 16. Forms, Native Submission, and Reset Handling

Basalt form controls participate in standard forms and controlled state pipelines.

Keep the Field's label/control/hint gap at 8px. Compose related fields with
`space-y-basalt-layout` or `gap-basalt-layout` (16px); separate sections with the
24px `layout-lg` role. The form owns the group gap, not each Field's margin.
Action buttons keep their 8px internal gap. DialogFooter owns 16px separation
from preceding content, so callers do not need a repeated margin override.

### Working Native HTML Form & FormData Pattern

Standard inputs (`Input`, `InputArea`, `Checkbox`, `Radio`, `Switch`) reliably supply their values via standard `FormData(event.currentTarget)`:

```tsx compile:integration-profile-form
import type React from "react";
import { Button, Field, Input, Switch } from "@nocoo/basalt";

export function ProfileForm() {
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const email = data.get("email");
		const notifications = data.get("notifications") === "on";
		console.log({ email, notifications });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-basalt-layout">
			<Field label="Email" hint="Your primary email address">
				<Input name="email" type="email" required />
			</Field>

			<Field label="Notifications">
				<Switch name="notifications" defaultChecked />
			</Field>

			<div className="flex gap-basalt-space-lg">
				<Button type="reset" variant="secondary">
					Reset
				</Button>
				<Button type="submit" variant="default">
					Save Changes
				</Button>
			</div>
		</form>
	);
}
```

### Controlled DatePicker Pattern

When using controlled state or building custom form adapters, `DatePicker` accepts an ISO date string (`YYYY-MM-DD`). In addition, you can control the active calendar view month (`YYYY-MM`) independently of the selected value via `month`, `defaultMonth`, and `onMonthChange`:

```tsx compile:integration-controlled-date-picker
import { useState } from "react";
import { DatePicker } from "@nocoo/basalt/components/date-picker";

export function ControlledDatePickerField() {
	const [selectedDate, setSelectedDate] = useState<string>("2026-09-01");
	const [activeMonth, setActiveMonth] = useState<string>("2026-09");

	return (
		<DatePicker
			value={selectedDate}
			onChange={setSelectedDate}
			month={activeMonth}
			onMonthChange={setActiveMonth}
			aria-label="Target Date"
		/>
	);
}
```

The month configuration rules:

- **`month` / `defaultMonth`**: Accept standard `YYYY-MM` strings with at least 4-digit positive civil years (e.g. `2026-09` and `10000-01`).
- **`defaultMonth` initialization**: `defaultMonth` only sets the initial displayed month on mount; subsequent changes to this prop do not reset the visible month.
- **Controlled `month` and fallback**: An active, valid `month` prop controls the displayed view. If the initial configuration is omitted or invalid, it smoothly falls back in sequence to a valid `defaultMonth`, the selected date's month, or the current month today (with the latter two clamped to `min`/`max` bounds).
- **Callback isolation**: `onMonthChange` is triggered only by user navigation actions (e.g. Prev/Next button clicks, keyboard page jumps), never during render or prop updates. External changes to `month` alter only the visible calendar page and do not modify the selected ISO date.

#### Keyboard Navigation and Labels

The calendar follows the WAI-ARIA grid pattern with a roving tab index:

- **Arrow keys (`Left` / `Right` / `Up` / `Down`)**: Move focus by day (±1) or week (±7), skipping disabled dates.
- **`Home` / `End`**: Jump to the start or end of the current row based on `weekStartsOn` (e.g. `0` for Sunday, `1` for Monday).
- **`PageDown` / `PageUp`**: Move by one month, clamping to valid month bounds (e.g. Jan 31 → Feb 28 or 29).
- **`Shift + PageDown` / `Shift + PageUp`**: Jump by one full year, maintaining month boundary clamping.
- **`Enter` / `Space`**: Select the focused day.
- **`Escape`**: Dismiss the calendar popover and return focus to the trigger button.

For internationalization, `locale` formats month titles and trigger values, while `labels` customizes accessible strings for navigation, validation messages, and placeholders:

```tsx compile:integration-datepicker-labels
import { DatePicker } from "@nocoo/basalt/components/date-picker";

export function LocalizedDatePickerExample() {
	return (
		<DatePicker
			locale="fr-FR"
			weekStartsOn={1}
			labels={{
				calendar: "Calendrier des dates",
				previousMonth: "Mois précédent",
				nextMonth: "Mois suivant",
				placeholder: "Sélectionnez une date",
				validationMessage: "Veuillez sélectionner une date valide.",
				keyboardInstructions: "Utilisez les flèches pour naviguer et Entrée pour valider.",
			}}
		/>
	);
}
```

### Empty states with actions

`Empty` and `LayerCard.Empty` support custom `children` and an interactive `action` control alongside structured `icon`, `title`, and `description`. Content renders in a consistent visual hierarchy: `icon` → `title` → `description` → `children` → `action`. Both `children` and `action` preserve numeric `0` values without drop.

```tsx compile:integration-empty-actions
import { useState } from "react";
import { Button } from "@nocoo/basalt/components/button";
import { Empty } from "@nocoo/basalt/components/empty";
import { LayerCard } from "@nocoo/basalt/components/layer-card";

export function EmptyActionExample() {
	const [created, setCreated] = useState(false);

	return (
		<LayerCard className="max-w-md">
			{created ? (
				<p className="text-sm text-basalt-foreground">Project created successfully.</p>
			) : (
				<Empty
					title="No projects found"
					description="You haven't created any workspace projects yet."
					action={
						<Button size="sm" onClick={() => setCreated(true)}>
							Create project
						</Button>
					}
				>
					<span className="text-xs text-basalt-muted-foreground">
						Get started by launching a new workspace.
					</span>
				</Empty>
			)}
		</LayerCard>
	);
}
```

### React Hook Form Adapter

When building forms with form libraries like `react-hook-form`, wrap composite controls like `DatePicker` using `Controller`. For native controls like `Input`, register them directly with validation rules:

```tsx compile:integration-rhf-controller
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Field, Input } from "@nocoo/basalt";
import { DatePicker } from "@nocoo/basalt/components/date-picker";

interface ProjectFormValues {
	projectName: string;
	startDate: string;
}

const defaultValues: ProjectFormValues = {
	projectName: "",
	startDate: "2026-09-01",
};

export function ProjectSettingsForm() {
	const [submittedData, setSubmittedData] = useState<ProjectFormValues | null>(null);

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProjectFormValues>({
		defaultValues,
	});

	const onSubmit = (values: ProjectFormValues) => {
		setSubmittedData(values);
	};

	const handleControlledReset = () => {
		reset(defaultValues);
		setSubmittedData(null);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-basalt-layout">
			<Field
				label="Project Name"
				hint="Unique name for your project workspace"
				error={errors.projectName?.message}
			>
				<Input
					{...register("projectName", {
						required: "Project name is required",
						minLength: { value: 3, message: "Minimum 3 characters required" },
					})}
					placeholder="e.g. Acme Dashboard"
					aria-label="Project Name"
				/>
			</Field>

			<Controller
				name="startDate"
				control={control}
				rules={{ required: "Start date is required" }}
				render={({ field }) => (
					<Field
						label="Start Date"
						hint="Initial project milestone date (YYYY-MM-DD)"
						error={errors.startDate?.message}
					>
						<DatePicker
							name={field.name}
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							aria-label="Start Date"
						/>
					</Field>
				)}
			/>

			{submittedData && (
				<div
					data-testid="submission-output"
					className="text-sm font-mono p-basalt-space-lg border rounded"
				>
					Submitted: {JSON.stringify(submittedData)}
				</div>
			)}

			<div className="flex gap-basalt-space-lg">
				<Button type="button" variant="secondary" onClick={handleControlledReset}>
					Reset
				</Button>
				<Button type="submit" variant="default" disabled={isSubmitting}>
					Save Project
				</Button>
			</div>
		</form>
	);
}
```

### Known Form Limitations

1. `DatePicker` external ref merging & focus target: forwarding a custom `ref` correctly targets the underlying native `input` element with full object/callback/React 19 cleanup support and preserves native form association and reset behavior; note that the forwarded `ref` points to the native input element (not the visual trigger button).
2. `Field` composition with Form Library Controllers: `Field` clones its immediate child element to inject accessibility IDs (`id`, `aria-describedby`). When wrapping controls with an abstraction like `react-hook-form`'s `<Controller>`, render `<Field>` **inside** the `Controller`'s `render` prop (wrapping the actual input control) rather than nesting `Controller` inside `Field`.
3. `Autocomplete` free-text commit on blur: unselected free text and matching suggestions commit on blur without reclaiming focus, preserving natural Tab / Shift+Tab navigation and pointer departures.
4. Native `required` validation on composite controls: empty required `DatePicker` validation surfaces errors on the visible trigger button and directs user focus to the trigger without focusing the hidden 1×1px input.

---

## 17. Step-by-Step Migration Guide

### Migrating to `@nocoo/basalt`

1. **Step 1: Install Package & Peer Dependencies**

   ```bash
   bun add @nocoo/basalt
   ```
2. **Step 2: Configure Stylesheet & Scan Sources**
   - In Tailwind v4 setups, use the two-line stylesheet contract:

     ```css
     @import "@nocoo/basalt/styles";
     @import "tailwindcss";
     ```
   - In non-Tailwind applications, import `@nocoo/basalt/styles/standalone` in your application root instead.
   - Remove custom `--color-*` or `--basalt-*` overrides in app CSS.
3. **Step 3: Establish Outer Frame**
   - Wrap application routes in `ThemeProvider` and `LinkProvider`.
   - Implement `/login` as an isolated badge page outside `AppShell`.
   - Use `AppShell` with `Sidebar` and `AppHeader` for authenticated layout.
4. **Step 4: Update Component Imports & Subpaths**
   - Import base components from `@nocoo/basalt` root.
   - Import layout chrome (`PageHeader`, `SectionRule`, `AppHeader`, `AppShell`) from granular subpaths (`@nocoo/basalt/components/*`).
   - Compose `ChartFrame`, `ChartLegend`, and `ChartTooltipContent` from `@nocoo/basalt/components/chart` with the application-owned chart engine (for example Recharts).
5. **Step 5: Verify Contrast, Surface Tokens & Form Handling**
   - Verify all content cards use `LayerCard` or surface classes rather than manual border/background combinations.
   - For composite forms (`DatePicker`, `Autocomplete`), implement controlled state or wrap in form library Controllers (e.g. `react-hook-form`).

---

## 18. Chart Subsystem Primitives

Basalt owns engine-agnostic chart chrome through `@nocoo/basalt/components/chart`; the application owns Recharts, ECharts, SVG, loading, aggregation, and domain formatting. `ChartFrame` accepts `ReactNode`, preserves a grouped accessible label, optional summary, structured data alternative, and legend slot without importing a chart engine. Its optional `accessibilityLayer` prop is forwarded to a component child only when explicitly supplied; applications configure ResponsiveContainer or nested engines directly.

```tsx excerpt:integration-chart-frame
import {
	ChartFrame,
	ChartLegend,
	ChartTooltipContent,
} from "@nocoo/basalt/components/chart";
import { ResponsiveContainer } from "recharts";

<ChartFrame
	ariaLabel="Monthly requests"
	summary="Requests increased from 12 to 18."
	legend={<ChartLegend items={[{ key: "requests", label: "Requests" }]} />}
>
	<ResponsiveContainer width="100%" height="100%">{chartGraphic}</ResponsiveContainer>
</ChartFrame>;
```

`ChartTooltipContent`, `ChartTooltipRow`, `ChartTooltipDivider`, and `ChartTooltipSummary` provide the shared popover presentation. `CHART_COLORS`, `chart`, `chartAxis`, `chartMuted`, `withAlpha`, `CHART_TYPE`, `chartFontSize`, `seriesColor`, and `ChartSeriesDescriptor` provide engine-neutral tokens and series metadata.

<a id="stat-card"></a>

### StatCard & StatGrid (`@nocoo/basalt/components/stat-card`)

`StatCard` presents a metric in one `LayerCard` surface with optional `icon: React.ReactNode`, trend, action, status, and supporting content. `StatGrid` arranges 2, 3, or 4 cards. Metric cards preserve tabular values, wrapping labels, and accessible display/group roles while callers own domain formatting and chart data.

## 19. Complete Framework Recipes & Compilable Guides

### 1. Vite + Standalone CSS Integration (No Tailwind)

For applications that choose not to install or configure Tailwind CSS, Basalt distributes an all-in-one stylesheet `@nocoo/basalt/styles/standalone`. This bundle includes CSS design tokens, typography, and control surfaces.

```tsx compile:integration-vite-standalone
import "@nocoo/basalt/styles/standalone";
import React, { useState } from "react";
import { Button, Input, LayerCard, ThemeProvider, ThemeToggle } from "@nocoo/basalt";
import { PageHeader } from "@nocoo/basalt/components/page-header";

export function StandaloneViteApp() {
	const [query, setQuery] = useState("");

	return (
		<ThemeProvider>
			<div className="min-h-screen bg-basalt-background text-basalt-foreground p-basalt-space-lg space-y-basalt-space-lg">
				<PageHeader
					title="Standalone Workspace"
					description="Rendered with @nocoo/basalt/styles/standalone without Tailwind preflight"
					actions={<ThemeToggle aria-label="Toggle visual theme" />}
				/>
				<LayerCard>
					<LayerCard.Header>
						<span className="font-semibold text-basalt-foreground">Project Search</span>
					</LayerCard.Header>
					<LayerCard.Body>
						<div className="flex gap-basalt-space-lg max-w-md">
							<Input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search resources..."
								aria-label="Search resources"
							/>
							<Button variant="default" onClick={() => console.log(query)}>
								Search
							</Button>
						</div>
					</LayerCard.Body>
				</LayerCard>
			</div>
		</ThemeProvider>
	);
}
```

### 2. Next.js App Router Client Boundary & SSR Theme Setup

Basalt controls depend on browser event handling and DOM lifecycle observers. In Next.js App Router applications, mount Basalt components within a dedicated client boundary.

#### Next.js Root Layout (`app/layout.tsx`) with Global CSS & Pre-Hydration Script

In Next.js App Router, import your global stylesheet (e.g. `app/globals.css` containing the Tailwind v4 contract or `@nocoo/basalt/styles/standalone`) at the root layout.
`ThemeProvider` applies the active theme to `document.documentElement` (`class="dark"|"light"` and `data-mode="dark"|"light"`). By default, it reads and persists to `localStorage` under key `"theme"` with fallback `"system"`. If custom `storageKey` or `defaultTheme` is configured on `ThemeProvider`, the pre-hydration script must use the identical key and fallback. When an external host system or meta-framework manages root theme attributes, configure `persist={false}` and `applyToDocument={false}`.

To eliminate flash of unstyled content (FOUC) under default persistence, inject a pre-hydration script into the root HTML layout before React hydrates:

```tsx compile:integration-nextjs-root-layout
import type React from "react";
import type { ReactNode } from "react";
// In your Next.js application, import the global stylesheet:
// import "./globals.css";
// or with standalone styles:
import "@nocoo/basalt/styles/standalone";

const themeInitScript = `(function(){try{var s=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var isDark=s==="dark"||(s!=="light"&&d);document.documentElement.classList.toggle("dark",isDark);document.documentElement.classList.toggle("light",!isDark);document.documentElement.dataset.mode=isDark?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: themeInitScript,
					}}
				/>
			</head>
			<body className="min-h-screen bg-basalt-background text-basalt-foreground antialiased">
				{children}
			</body>
		</html>
	);
}
```

#### Client Page Component (`app/dashboard/page.tsx`)

In Next.js App Router, mark interactive client components with `"use client"`. Place client UI in a client component or export it as default page export for a route:

```tsx compile:integration-nextjs-client-boundary
"use client";

import React, { useState } from "react";
import { Button, Input, LayerCard, ThemeProvider, ThemeToggle } from "@nocoo/basalt";

export default function NextClientDashboardPage() {
	const [metricName, setMetricName] = useState("Daily Active Users");

	return (
		<ThemeProvider>
			<div className="p-basalt-space-lg space-y-basalt-space-lg">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-bold text-basalt-foreground">Next.js Client Dashboard</h2>
					<ThemeToggle aria-label="Toggle theme mode" />
				</div>
				<LayerCard>
					<LayerCard.Header>Metric Details</LayerCard.Header>
					<LayerCard.Body>
						<Input
							value={metricName}
							onChange={(e) => setMetricName(e.target.value)}
							aria-label="Metric Name"
						/>
						<div className="mt-basalt-space-lg">
							<Button variant="outline" onClick={() => setMetricName("Default Metric")}>
								Reset Metric
							</Button>
						</div>
					</LayerCard.Body>
				</LayerCard>
			</div>
		</ThemeProvider>
	);
}
```

### 3. Router Navigation Adapter with LinkProvider

Basalt components that perform client navigation (such as breadcrumbs, sidebars, and custom action links) consume navigation through `LinkProvider`. `LinkProvider` accepts a custom component via the `render` prop:
- Prop shape: `render: ComponentType<{ href: string; className?: string; children?: ReactNode }>`
- Custom components consume the active link implementation using `useLinkComponent()`, which is exported from `@nocoo/basalt/providers/link` (and re-exported by `@nocoo/basalt/components/link`). It returns either the custom adapter or the fallback `"a"`.

The following compilable example demonstrates a real router link adapter integrated with `react-router` (`Link`, `Routes`, `Route`, `MemoryRouter`):

```tsx compile:integration-router-adapter
import type { ComponentType, ReactNode } from "react";
import React from "react";
import { MemoryRouter, Routes, Route, Link as RouterLink, useLocation } from "react-router";
import { LinkProvider } from "@nocoo/basalt";
import { useLinkComponent } from "@nocoo/basalt/providers/link";

// Real router adapter mapping Basalt href/className/children to React Router Link
export const ReactRouterLinkAdapter: ComponentType<{
	href: string;
	className?: string;
	children?: ReactNode;
}> = ({ href, className, children }) => {
	const isExternal =
		href.startsWith("http://") ||
		href.startsWith("https://") ||
		href.startsWith("//") ||
		href.startsWith("mailto:") ||
		href.startsWith("tel:");

	if (isExternal) {
		return (
			<a href={href} className={className} rel="noopener noreferrer" target="_blank">
				{children}
			</a>
		);
	}

	return (
		<RouterLink to={href} className={className}>
			{children}
		</RouterLink>
	);
};

export function RoutedNavigationSection() {
	return (
		<MemoryRouter initialEntries={["/dashboard"]}>
			<LinkProvider render={ReactRouterLinkAdapter}>
				<nav className="flex gap-basalt-space-lg p-basalt-space-lg border-b border-basalt-border">
					<NavigationItem href="/dashboard">Dashboard</NavigationItem>
					<NavigationItem href="/settings">Settings</NavigationItem>
					<NavigationItem href="https://docs.hexly.ai">External Docs</NavigationItem>
				</nav>
				<div className="p-basalt-space-lg">
					<Routes>
						<Route path="/dashboard" element={<DashboardPage />} />
						<Route path="/settings" element={<SettingsPage />} />
					</Routes>
				</div>
			</LinkProvider>
		</MemoryRouter>
	);
}

function NavigationItem({ href, children }: { href: string; children: ReactNode }) {
	const LinkComponent = useLinkComponent();
	return (
		<LinkComponent
			href={href}
			className="text-sm font-medium hover:underline text-basalt-foreground"
		>
			{children}
		</LinkComponent>
	);
}

function DashboardPage() {
	const location = useLocation();
	return <div data-testid="active-route">Active Location: {location.pathname}</div>;
}

function SettingsPage() {
	const location = useLocation();
	return <div data-testid="active-route">Settings Location: {location.pathname}</div>;
}
```

### 4. Native Form Submission and Reset Handling

For lightweight forms without third-party form libraries, native HTML forms paired with `FormData` provide reliable data collection across Basalt controls:

```tsx compile:integration-native-form-reset
import type React from "react";
import { useState } from "react";
import { Button, Field, Input, Switch } from "@nocoo/basalt";

export function UserPreferencesForm() {
	const [feedback, setFeedback] = useState<string>("");

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const username = String(data.get("username") ?? "");
		const emailAlerts = data.get("emailAlerts") === "on";
		setFeedback(
			`Saved preferences for ${username} (alerts: ${emailAlerts ? "enabled" : "disabled"})`,
		);
	};

	const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
		setFeedback("Form reset to default values");
	};

	return (
		<form onSubmit={handleSubmit} onReset={handleReset} className="space-y-basalt-layout max-w-sm">
			<Field label="Username" hint="Public profile handle">
				<Input name="username" defaultValue="johndoe" required />
			</Field>

			<Field label="Email Alerts" hint="Receive daily system digests">
				<Switch name="emailAlerts" defaultChecked />
			</Field>

			{feedback && (
				<div role="status" className="text-sm text-basalt-muted-foreground">
					{feedback}
				</div>
			)}

			<div className="flex gap-basalt-space-lg">
				<Button type="reset" variant="secondary">
					Reset
				</Button>
				<Button type="submit" variant="default">
					Save
				</Button>
			</div>
		</form>
	);
}
```

### Confirmation focus after responsive replacement

`ConfirmDialog.onCloseAutoFocus` receives the same cancelable event as `AlertDialogContent.onCloseAutoFocus`. It runs after the close focus trap releases. Call `event.preventDefault()` and focus the currently mounted action when a responsive layout replaced the original opener. Without prevention, ConfirmDialog restores the connected explicit trigger or captured opener as usual. Do not race that lifecycle with a close-state effect or timeout.

```tsx excerpt:confirmation-focus-replacement
<ConfirmDialog
	open={confirmOpen}
	onOpenChange={setConfirmOpen}
	title="Remove item?"
	description="This action cannot be undone."
	onConfirm={removeItem}
	onCloseAutoFocus={(event) => {
		event.preventDefault();
		currentActionRef.current?.focus();
	}}
/>;
```

### Dense controls and moving list highlights

Button (including icon buttons), Input, SelectTrigger, InputGroup and their composing controls default to 34px high. Explicit `sm`/`lg` sizes remain available; InputArea remains multiline. Compact application headers retain their 44px minimum touch targets.

Select, DropdownMenu, ContextMenuPanel, Autocomplete and MultiSelect use one list-local hover layer. Its private DOM adapter batches reads in requestAnimationFrame, measures only when row/focus/selection/size changes, and updates CSS variables without a React state render. Position animates with transform, not top/left layout; reduced motion removes transitions. Disabled/hidden rows are excluded, keyboard focus takes priority, and observers/listeners are released with the mounted list. CommandPalette's list shrinks with its viewport so all rows remain reachable even inside short frames.

Loader uses eight perimeter cells with an empty center, moving clockwise continuously. Label, shimmer and delayed elapsed-time controls are unchanged.

## Dimension tokens

Basalt geometry no longer depends on a host's Tailwind `--spacing`. Both CSS entrypoints expose the same `--basalt-space-*` and `--basalt-size-*` variables. Override semantic roles on a shared ancestor; portaled overlays inherit from their portal ancestor, so application-wide settings belong on `:root`. Theme switches do not reset dimensions.

| Role                                    | Token                                                                                                       | Default                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Small / default / large control         | `--basalt-size-control-sm`, `--basalt-size-control`, `--basalt-size-control-lg`                             | 28 / 34 / 40px                                      |
| Compact / standard / display icon       | `--basalt-size-icon-sm`, `--basalt-size-icon`, `--basalt-size-icon-lg`                                      | 12 / 14 / 16px                                      |
| Nested action                           | `--basalt-size-control-inset`                                                                               | 28px                                                |
| Minimum touch target                    | `--basalt-size-touch`                                                                                       | 44px                                                |
| Menu option                             | `--basalt-size-menu-row`, `--basalt-space-menu-inset`, `--basalt-space-menu-x`, `--basalt-space-menu-y`     | 34px / 8px / 8px / 6px                              |
| Card padding                            | `--basalt-space-card-sm`, `--basalt-space-card`, `--basalt-space-card-lg`, `--basalt-space-card-xl`         | 12 / 16 / 24 / 32px; default 16px                   |
| Layout spacing                          | `--basalt-space-layout-sm`, `--basalt-space-layout`, `--basalt-space-layout-lg`, `--basalt-space-layout-xl` | 12 / 16 / 24 / 32px; grids 16px, page sections 24px |
| Field label gap                         | `--basalt-space-field-gap`                                                                                  | 8px                                                 |
| Textarea minimum height                 | `--basalt-size-textarea-sm`, `--basalt-size-textarea`, `--basalt-size-textarea-lg`                          | 64 / 80 / 96px                                      |
| Table row / horizontal / vertical inset | `--basalt-size-table-row`, `--basalt-space-table-x`, `--basalt-space-table-y`                               | 36 / 8 / 6px                                        |
| Attached table outer edge               | `--basalt-space-table-edge`                                                                                 | Panel horizontal inset, 16px                        |

Defaults use rem and unitless line-height, preserving browser font-size preferences. [DESIGN.md](DESIGN.md) defines compact 2/4/6/8px control spacing, separate 12/16/24/32px card and layout spacing, and natural 22/34/46px inline/action/banner categories. The size tokens describe reference geometry, not fixed text-control heights. Use the semantic spacing role for the boundary being laid out; numbered geometry tokens are not padding alternatives. LayerCard accepts `padding="sm|md|lg|xl"` for unstructured content; Grid accepts `gap="sm|md|lg|xl"`. Both default to `md`; 32px `xl` is opt-in. ContentIsland owns a 16px mobile, 24px tablet, and 32px horizontal / 24px vertical desktop inset. Examples must use component size props rather than fixed-height overrides. Textareas, avatars and panels retain content-specific geometry.

### Compact record tables

DataTable uses 13px single-line content, 36px minimum rows, tokenized horizontal/vertical insets and a native horizontally scrollable region. A column's `width` is also its minimum width; the browser must not squeeze names/dates into accidental multi-line rows. Use `column.wrap: true` for actual prose fields, or an explicitly sized inner `truncate` element with a title for long record names and URLs. `maxHeight` bounds the existing scroll region, with sticky opaque headers that stay inside it. Sorting uses a fixed 12px icon slot and retains `aria-sort`; row selection uses the shared Checkbox rather than an unstyled native checkbox. Rich `headerContent` composes icons and labels without changing the plain accessible sort name. Empty/loading/error content remains readable and wraps independently of data-cell defaults.

Use `column.textAlign: "end"` for comparable numbers: the header and values share
a logical end rail, with the sort glyph inward of the header label. `"start"` is
the other explicit direction; omitted body-cell alignment remains inherited.
The same `textAlign` prop is available on TableHead, TableCell and
TableSortableHeader from `@nocoo/basalt/components/table`. It does not replace
native HTML `align` attributes. Logical directions follow LTR/RTL consistently.

TableSortableHeader is a flush, ref-forwarding button, not a generic Button with
extra padding. Pass its `sorted` direction (`"asc"` / `"desc"`, or omitted) and
sort callback; the enclosing TableHead owns `aria-sort`. Unsortable headers remain
plain text, not disabled sort controls. DataTable handles those details for its
own columns.

For a DataTable directly attached to a LayerCard, set `edge="attached"`. It uses
the 16px panel rail only at the outermost cells, including optional number/select
columns and full-width state rows. Intercolumn spacing stays 8px per cell side.
Built-in pagination shares that panel rail and its 12px bottom inset.
The default `edge="inset"` keeps ordinary table spacing inside an already padded
region; do not add a zero-padding Body around an attached table.

```tsx compile:integration-attached-table
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { LayerCard } from "@nocoo/basalt/components/layer-card";

type Invoice = { id: string; amount: number };
const columns: DataTableColumn<Invoice>[] = [
	{ id: "id", header: "Invoice", accessor: (row) => row.id },
	{ id: "amount", header: "Amount", accessor: (row) => row.amount, textAlign: "end" },
];

export function InvoicePanel() {
	return (
		<LayerCard>
			<LayerCard.Header>Invoices</LayerCard.Header>
			<DataTable
				aria-label="Invoices"
				edge="attached"
				columns={columns}
				data={[
					{ id: "INV-01", amount: 1240 },
					{ id: "INV-02", amount: 80 },
				]}
				getRowId={(row) => row.id}
			/>
		</LayerCard>
	);
}
```

Native Table does not infer a grid from its children. For an attached native
composition, mark the true inline-start cells with `ps-basalt-table-edge`, the
inline-end cells with `pe-basalt-table-edge`, and a full-width cell with both.
Rows continuing a preceding `rowSpan` do not gain a new edge at their first DOM
child. These token utilities keep cell backgrounds, sticky headers and separators
full width without affecting nested tables. Use ordinary Table cells when no
panel edge is being attached.

TableCaption owns balanced `--basalt-space-panel-x` / `--basalt-space-panel-y`
insets (16px horizontal / 12px vertical), not an outside top margin. Keep it
inside the native table; do not pad the entire scroll region or compensate with
an extra footer wrapper. This preserves full-width row paint and readable space
above and below the description inside an enclosing frame.

### Record numbering and identity

Set `DataTable.rowNumbers` to show an additional `#` column. Numbers follow current sorted/filtered display order and continue from the resolved page offset, including server pagination. They never replace stable row IDs or selection keys. `AvatarInitials` on `components/avatar` reuses the circular Avatar surface with deterministic semantic colors and the first two word initials; `colorKey` keeps color stable across renames and `initials` supports application abbreviations. `size="sm"` is 24px for compact records. Keep the full name as its accessible label.

### Composite alignment

Use one padding owner per boundary: `--basalt-space-panel-x/y` (16/12px) for composite card/header/body/footer sections, `--basalt-space-row-x/y/gap` (8/6/8px) for selectable rows, and `--basalt-space-content-gap` (8px) between related controls inside a composite. Page section gaps instead use `--basalt-space-layout-lg` (24px). `--basalt-space-row-content` derives the detail inset from row padding + a 16px icon slot + the row gap. Selectable action rows use the 22px `--basalt-line-row`, producing 34px single-line rows and growing by full lines when content wraps. Status icons occupy a first-line-height slot, not an arbitrary top margin. Body prose and code keep the 20px body line-height. Ordinary controls use 34px; inline message actions use the 34px `--basalt-size-action` target and 14px glyphs. Align visible glyphs with prose without removing their pointer target.

These are local alignment rails, not one universal left edge. Page headings align
to the island; card slots align to their panel; columns align their own labels and
values. A checkbox, row number or optional status glyph has a consistent semantic
slot. Distinct boundaries may add spacing, but the same boundary has one owner.
See [alignment hierarchy](DESIGN.md#alignment-hierarchy). Keep nested preview focus
clearance and give wide table examples enough columns rather than shrinking all
their padding to fit a thumbnail.

The standalone build generates every Tailwind utility once in canonical order. Do not append handwritten copies of `.p-0`, `.bg-transparent` or other native utilities after generated axis/state rules: a later shorthand can silently erase semantic padding. Browser acceptance measures actual computed insets in both CSS entrypoints, under foreign host spacing and semantic overrides.

Public Radio, Checkbox, Switch and SegmentControl group roots establish the scoped `.basalt-ui` reset. Fieldsets and legends have no browser-default padding/margin inside that boundary; standalone and Tailwind consumers must have identical group insets. SegmentControl's horizontal scrolling viewport has 4px focus clearance on every edge and matching scroll-padding so keyboard navigation can reveal end items; the ToggleGroup track retains its 2px compact inset and 34px item geometry. Host form groups outside Basalt remain untouched.

Native form legends do not participate in a fieldset's flex gap. Radio, Checkbox and Switch legends therefore own `margin-bottom: var(--basalt-space-field-gap)` (8px) independently of the group's row layout. Do not replace the semantic legend or add wrapper divs to simulate this spacing. Override the existing field-gap token when a different group density is required.

### Code panels

`CodeBlock` and `CodeHighlighted` share one compact code panel: optional `title`, a decorative `icon` (default file-code glyph, `null` to hide), `copyable` (true by default) and `lineNumbers` (false by default). Plain CodeBlock takes string children; CodeHighlighted takes `code` and reuses the lightweight built-in tokenizer. The root now forwards HTMLDivElement attributes and `className`; its inner named, keyboard-focusable pre owns scrolling. Do not pass rendered React children or assume the root is a pre. Use `copyable={false}` without a title for headerless output. Existing `max-h-*` classes constrain the panel while the source region scrolls; the header remains visible.

For edge-attached content, use `attached` rather than overriding border, radius or padding classes. It removes the outer frame except the top separator and keeps code-owned insets. Do not wrap attached code in LayerCard.Body. The standard full-width disclosure is `Collapsible asChild` around a LayerCard, with `LayerCard.Header asChild` around CollapsibleTrigger and `CollapsibleContent unstyled` around a Body or self-inset code/table. Header owns the full hit target and aligned 16/12px insets; Collapsible owns only interaction and motion. See [container boundary ownership](DESIGN.md#container-boundary-ownership), also used by the catalog's navigation and example panels.

Code panels contain horizontal overscroll only. Vertical wheel/touch scrolling chains to the page: natural-height examples do not trap it, and explicitly height-constrained panels hand it off at their top/bottom edge. No JavaScript wheel interception or axis conversion is used. Horizontal gestures and focused Left/Right arrow keys still scroll long source lines without moving the header.

Panel insets use the shared 16/12px roles. Code panel content and header titles use the shared 13px compact font token (.8125rem / `text-basalt-md`), with source lines on a 20px line box and a 34px copy target. Inline `Code` retains the 12px auxiliary tier (.75rem / `text-basalt-sm`). Source lines retain empty and trailing lines, with horizontal scrolling rather than breaking tokens. The hidden, non-selectable line-number gutter uses CSS-generated text, so numbers never enter clipboard output or assistive reading. Copy uses the exact original source (including CRLF), prevents concurrent writes, reports permission/API failure and permits retry; feedback belongs to that source revision. No source text is interpreted as HTML or executed. Private model/ViewModel modules own tokenization and copy state; browser clipboard access remains in the View. This is not a language parser or a text-diff viewer.
