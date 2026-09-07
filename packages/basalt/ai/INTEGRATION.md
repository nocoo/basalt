# Basalt application chrome

This is the one-pass setup for a Basalt app. An MVP is **login + shell + one page**. After that, product work is arranging `LayerCard` on the island. Do not invent a second header, a second rail, or a second title above the content heading.

The library owns the rail, the main column, collapse motion, the island, the page heading, and region rules. The app owns navigation data, brand, version, identity, and page bodies.

Package: `@nocoo/basalt`. React 19. Tailwind v4.

---

## 1. MVP

Ship in this order. Each step has a section below. Do not skip ahead to cards.

1. **Providers + CSS** — §2–5
2. **Login** — full-viewport badge. No shell. §11
3. **App frame** — skip link, sidebar (product title + version + nav), header (crumbs + current page + top-right), island. §6–10
4. **First page** — `PageHeader` (title, subtitle, create, filters) then cards. Optional `SectionRule`. §13–15

### Who owns what

| Layer | Component | Owns | Does not own |
|---|---|---|---|
| Login | app page, not `AppShell` | identity badge | rail, header, island |
| Rail | `Sidebar` | product title, version pill, nav, user | page body |
| Framework bar | `AppHeader` | ancestor breadcrumbs, current page name, top-right actions (`ThemeToggle`, …) | create, filters, cards |
| Island | `ContentIsland` | L1 surface and scroll | page chrome |
| Page heading | `PageHeader` | content title, subtitle, create last, filters | `AppHeader` crumbs |
| Region | `SectionRule` | dashed title rule, optional hint, optional region actions | `LayerCard.Header` |
| Card | `LayerCard` | nested surface | page title |

### Tree

```
LoginPage                         ← /login only. No AppShell.

AppShell                          ← everything else
├── AppSkipLink
├── Sidebar                       ← product title + version + nav
└── AppMain                       ← id="main-content"
    ├── AppHeader                 ← crumbs + current page | top-right
    └── island wrap               ← px-2 pb-2 md:px-3 md:pb-3
        └── ContentIsland
            ├── PageHeader        ← title + subtitle | create / short filters
            │                     ← optional own-row complex filters
            ├── SectionRule?      ← optional region split
            └── LayerCard…        ← all later product UI
```

`AppHeader.title` is the current page in the top bar (`h1`, `text-sm`). `PageHeader.title` is the content heading (`h1`, `text-2xl`). They may use the same words. They are different roles. Do not put an icon + page name above `PageHeader` — that duplicates the bar.

When `AppHeader` already has breadcrumbs, **omit** `PageHeader.breadcrumbs`.

Live: `/login`, shell, first page `/data`, surfaces `/layout`. Catalog: `/ui/page-header`, `/ui/section-rule`.

---

## 2. Install and CSS

```bash
npm i @nocoo/basalt lucide-react
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

In the app stylesheet (e.g. `src/index.css`), the exact 3-line import order is required. The `@source` path is relative to **this CSS file** and must scan `node_modules/@nocoo/basalt/dist`:

```css
@source "../node_modules/@nocoo/basalt/dist/**/*.{js,jsx,ts,tsx}";
@import "@nocoo/basalt/styles/tailwind";
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
const stored = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isDark = stored === "dark" || (stored !== "light" && prefersDark);
document.documentElement.classList.toggle("dark", isDark);
document.documentElement.classList.toggle("light", !isDark);
document.documentElement.dataset.mode = isDark ? "dark" : "light";
```

---

## 3. Imports

Root barrel is small leaves and providers. Shell chrome is granular.

| From | Import |
|---|---|
| `@nocoo/basalt` | `Button`, `Input`, `LayerCard`, `DescriptionList`, `Sidebar`, `SidebarHeader`, `SidebarNav`, `SidebarFooter`, `SidebarItem`, `SidebarIconItem`, `SidebarPartition`, `SidebarGroup`, `SidebarSearch`, `SidebarUser`, `ContentIsland`, `Sheet`, `SheetContent`, `SheetTitle`, `Avatar`, `AvatarFallback`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, `ThemeProvider`, `ThemeToggle`, `LinkProvider`, `Toaster`, `CommandPalette`, … |
| `@nocoo/basalt/components/app-shell` | `AppShell`, `AppMain`, `AppSkipLink` |
| `@nocoo/basalt/components/app-header` | `AppHeader` |
| `@nocoo/basalt/components/page-header` | `PageHeader` |
| `@nocoo/basalt/components/section-rule` | `SectionRule` |
| `@nocoo/basalt/components/loading-screen` | `LoadingScreen` |
| `@nocoo/basalt/components/basalt-mark` | `BasaltMark` |
| `@nocoo/basalt/providers/theme` | `useTheme` (if not taking `ThemeProvider` from the root) |
| `@nocoo/basalt/charts/*` | charts |
| `@nocoo/basalt/components/date-picker` | DatePicker |
| `@nocoo/basalt/components/data-table` | DataTable |

Off the root barrel: `AppShell`, `AppMain`, `AppSkipLink`, `AppHeader`, `PageHeader`, `SectionRule`, `LoadingScreen`, `BasaltMark`, charts, DatePicker, DataTable. Import those from the granular paths above. `LayerCard` is on the root barrel **and** `@nocoo/basalt/components/layer-card`.

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
          <Route element={<AppFrame />}>
            {/* authenticated pages */}
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </LinkProvider>
</ThemeProvider>
```

`LinkProvider` `render` must map `href` to the app router (React Router `Link`, etc.). External `http(s):` / `mailto:` / `tel:` stay as `<a>`.

`TooltipProvider` is required for collapsed-rail tooltips.

### ThemeProvider Configuration

`ThemeProvider` manages color scheme mode (`"light" | "dark" | "system"`). It synchronizes active classes (`light`/`dark`) and attributes (`data-mode="dark"|"light"`) onto `document.documentElement`, supports cross-tab and same-page synchronization, and provides graceful fallback when storage is restricted.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | *(required)* | Application components wrapped by the theme context. |
| `storageKey` | `string` | `"theme"` | Key used for `localStorage` persistence. |
| `defaultTheme` | `BasaltTheme` (`"light"` \| `"dark"` \| `"system"`) | `"system"` | Initial fallback theme during SSR or when no stored preference exists. |
| `persist` | `boolean` | `true` | When `false`, completely isolates the provider from `localStorage` (never reads or writes storage, does not broadcast or listen to external storage events). |
| `theme` | `BasaltTheme` | `undefined` | Controlled theme value. When supplied, internal state is driven by this prop. |
| `onThemeChange` | `(theme: BasaltTheme) => void` | `undefined` | Callback fired when a theme change is requested. In controlled mode, callers update `theme`. |
| `applyToDocument` | `boolean` | `true` | When `false`, disables mutating classes or dataset on `document.documentElement`, allowing a host theme system to manage root DOM state. |

- **Hook `useTheme()`**: Returns `{ theme: BasaltTheme, setTheme: (theme: BasaltTheme) => void }`. Throws an error when invoked outside a `ThemeProvider`.
- **Storage failure resilience**: If reading or writing `localStorage` throws (e.g. quota exceeded or sandboxed iframe security error), `ThemeProvider` catches the error, retains the explicit selection in memory, and suppresses stale bare storage events from rolling back state.
- **SSR & Hydration**: During SSR, `ThemeProvider` returns controlled `theme` (if provided) or `defaultTheme`. On the client, it hydrates from `localStorage` if `persist=true`. When custom `storageKey` or `defaultTheme` is configured, pre-hydration inline scripts must match the same key and default.
- **Host management**: Set `persist={false}` and `applyToDocument={false}` when nested inside an external theme system or embedded widget to prevent mutating the global document root or polluting host storage.

<a id="accent-provider"></a>

### AccentProvider and useAccent

`AccentProvider` manages dynamic primary accent color overrides (`--basalt-primary`, `--basalt-primary-foreground`, `--basalt-ring`, and `dataset.accent`). It does not alter chart palette tokens (`--basalt-chart-*`).

#### AccentProvider Configuration

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | *(required)* | Application components wrapped by the accent context. |
| `storageKey` | `string` | `"basalt-accent"` | Key used for `localStorage` persistence. |
| `defaultAccent` | `string` | `"primary"` | Initial accent swatch ID during SSR or when no stored preference exists. |
| `persist` | `boolean` | `true` | When `false`, isolates the provider from `localStorage` (no storage read/write, no cross-tab sync). |
| `accent` | `string` | `undefined` | Controlled accent value. When supplied, internal state is driven by this prop. |
| `onAccentChange` | `(accent: string) => void` | `undefined` | Callback fired when an accent change is requested. |
| `applyToDocument` | `boolean` | `true` | When `false`, disables writing CSS custom properties and `data-accent` to `document.documentElement`. |

- **Hook `useAccent()`**: Returns `{ accent: string, setAccent: (id: string) => void, swatches: readonly AccentSwatch[] }`. Throws an error when invoked outside an `AccentProvider`.
- **`AccentSwatch` Type**:
  - `id: string`: Unique swatch identifier (e.g., `"primary"`, `"teal"`, `"rose"`).
  - `label: string`: Human-readable swatch name.
  - `token: string`: CSS variable token binding (e.g., `"--basalt-chart-1"`).
  - `light: string`: HSL values applied in light mode (e.g., `"217 91% 60%"`).
  - `dark: string`: HSL values applied in dark mode (e.g., `"217 91% 65%"`).
- **Utilities**:
  - `ACCENT_SWATCHES`: Readonly array of 24 predefined `AccentSwatch` objects.
  - `DEFAULT_ACCENT_ID`: Default accent ID (`"primary"`).
  - `accentSwatchById(id: string | null | undefined): AccentSwatch`: Finds matching swatch by `id`, defaulting to `ACCENT_SWATCHES[0]` if not found.
  - `accentForeground(hsl: string)`: Compares WCAG contrast against white and dark text and returns the higher-contrast pairing (`"0 0% 10%"` or `"0 0% 100%"`). Note: selecting higher contrast does not guarantee arbitrary custom colors reach 4.5:1.
  - `applyAccent(id: string, dark = false): void`: Sets CSS variables `--basalt-primary`, `--basalt-primary-foreground`, `--basalt-ring`, and `dataset.accent` on the document root element. For built-in palette swatches, semantic `--basalt-primary` is derived to guarantee WCAG 4.5:1 text/button contrast across L0–L3 surfaces and 90% hover states without mutating chart swatch definitions (`ACCENT_SWATCHES`) or chart palette tokens. Badge variants pair corresponding semantic foreground tokens (`text-basalt-badge-*-foreground` / `text-basalt-*-foreground`). Accepts optional `dark` flag (defaults to `false`).
- **Known Limitations & Resilience**: Storage access gracefully degrades in sandboxed or quota-exceeded environments by preserving in-memory choices without throwing. SSR hydration serves controlled `accent` (if provided) or server snapshot defaults (`DEFAULT_ACCENT_ID = "primary"`). Built-in palette accents satisfy WCAG 4.5:1 across surfaces in both themes.

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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Theme: {theme}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        Toggle {theme === "dark" ? "Light" : "Dark"}
      </Button>
      <span className="text-sm font-medium ml-2">Accent: {accent}</span>
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
    <ThemeProvider
      persist={false}
      applyToDocument={false}
      theme={theme}
      onThemeChange={setTheme}
    >
      <AccentProvider
        persist={false}
        applyToDocument={false}
        accent={accent}
        onAccentChange={setAccent}
      >
        <div className="p-4 border rounded-lg space-y-3">
          <p className="text-xs text-basalt-muted-foreground">
            Host owns document root DOM and persistence. Basalt contexts operate safely without side-effects.
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

Icons: `lucide-react`, `strokeWidth={1.5}`, nav size `h-4 w-4 shrink-0`.

---

<a id="root-geometry"></a>
## 6. Root geometry

`AppShell` is a full-viewport flex row: `h-screen w-full overflow-hidden bg-basalt-background`.

```
AppShell                         ← flex row, h-screen, overflow hidden
├── AppSkipLink                  ← first child
├── Sidebar                      ← the rail (in-flow, not fixed)
└── AppMain                      ← flex-1 min-w-0 column, overflow hidden
    ├── AppHeader                ← h-14
    └── island wrap              ← flex-1 min-h-0, px-2 pb-2 md:px-3 md:pb-3
        └── ContentIsland        ← page outlet
```

### AppShell, AppMain, AppSkipLink API & Contracts

- **`AppShell`**: Viewport root container. Inherits standard `HTMLAttributes<HTMLDivElement>`. Renders a full-viewport flex row (`h-screen w-full overflow-hidden bg-basalt-background`). Does not forward ref.
- **`AppMain`**: Primary content container. Inherits standard `HTMLAttributes<HTMLElement>`. Defaults `id="main-content"` as the skip-link landmark target, which can be overridden by props via `{...props}`. Recommended to keep `"main-content"` matching `AppSkipLink`. Renders a vertical column with `h-full min-w-0 flex-1 flex-col overflow-hidden`. Does not forward ref.
- **`AppSkipLink`**: Accessibility skip target. Inherits standard `AnchorHTMLAttributes<HTMLAnchorElement>`. Defaults `href="#main-content"`. Renders screen-reader-only element that transitions into absolute focus overlay on keyboard navigation (`sr-only focus:not-sr-only focus:absolute ...`). Does not forward ref.

The island wrap is the only extra layout div in the main column. Pages render **inside** `ContentIsland`. Pages do not set `h-screen`, side padding, or a second card around the island.

---

## 7. Sidebar is the rail

`Sidebar` **is** the column. It already has:

- `h-screen`, `flex-col`, `shrink-0`, `sticky top-0`
- expanded width **260px** (inline `width`)
- collapsed width **68px**
- collapse animation `transition-all duration-300 ease-in-out`

Children of `Sidebar` are **regions only**: header, search, nav, footer. They fill that column. `SidebarNav` is `flex-1 min-h-0 overflow-y-auto`, so the footer stays at the bottom.

Do not wrap those regions in another full-viewport column. Do not set `h-screen`, `w-[260px]`, or `w-[68px]` on an inner element. Width and height stay on `Sidebar`.

### Expanded tree

```
Sidebar                          ← collapsed={false}; owns 260px and h-screen
├── SidebarHeader                ← h-14 px-3 already
│   └── brand row                ← flex, items-center, justify-between, w-full
│                                 (no extra horizontal padding)
├── search wrap                  ← px-3 pb-1 only
│   └── SidebarSearch
├── SidebarNav                   ← pt-1; flex-1
│   ├── SidebarPartition         ← label; already px-6
│   └── item stack               ← flex flex-col gap-0.5 px-3
│       └── SidebarItem          ← already px-3 py-2.5
└── SidebarFooter                ← px-4 py-3 already
    └── SidebarUser
```

`SidebarHeader` already pads horizontally. Brand, version pill, and collapse control go **directly** in it. The version string is read from the app `package.json` at build time. Never hardcode it.

Nav labels use `SidebarPartition`. The item stack is **one** `px-3` column (the same gutter `SidebarGroup` uses). `SidebarItem` already has its own `px-3`. That is the whole horizontal rhythm: partition at 24px, item content at 24px.

Collapsible sections use `SidebarGroup` instead of Partition + stack. `SidebarGroup` already includes the item gutter. Do not add another `px-3` around it.

```tsx excerpt:sidebar-expanded-structure
<Sidebar collapsed={collapsed}>
  <SidebarHeader>
    <div className="flex w-full items-center justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <BasaltMark className="h-5 w-5 shrink-0" />
        <span className="truncate text-lg font-semibold text-basalt-foreground md:text-xl">
          Acme
        </span>
        <span className="shrink-0 rounded-md bg-basalt-secondary px-1.5 py-0.5 text-[10px] leading-none font-medium text-basalt-muted-foreground">
          v{version}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onToggle}
        aria-label="Collapse sidebar"
      >
        <PanelLeft aria-hidden="true" />
      </Button>
    </div>
  </SidebarHeader>
  <div className="px-3 pb-1">
    <SidebarSearch onClick={() => setSearchOpen(true)}>Search</SidebarSearch>
  </div>
  <SidebarNav className="pt-1">
    {groups.map((group) => (
      <div key={group.label}>
        <SidebarPartition>{group.label}</SidebarPartition>
        <div className="flex flex-col gap-0.5 px-3">
          {group.items.map((item) => (
            <SidebarItem
              key={item.href}
              active={active(item.href)}
              onClick={() => navigate(item.href)}
            >
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
```

### Collapsed tree

Pass `collapsed` on `Sidebar`. The element becomes 68px. Children are icon-sized and centered. Still no inner width/height wrapper.

```
Sidebar                          ← collapsed; owns 68px
├── SidebarHeader                ← justify-center px-0
├── collapse Button              ← ghost icon, mb-1
├── search SidebarIconItem       ← mb-2; tooltip
├── SidebarNav                   ← w-full items-center gap-1 pt-1
│   └── SidebarIconItem          ← h-10 w-10; tooltip
└── SidebarFooter                ← flex w-full justify-center px-0
```

```tsx excerpt:sidebar-collapsed-structure
<Sidebar collapsed={collapsed}>
  <SidebarHeader className="justify-center px-0">
    <BasaltMark className="h-5 w-5" />
  </SidebarHeader>
  <Button
    variant="ghost"
    size="icon"
    className="mb-1 self-center"
    onClick={onToggle}
    aria-label="Expand sidebar"
  >
    <PanelLeft aria-hidden="true" />
  </Button>
  <Tooltip delayDuration={0}>
    <TooltipTrigger asChild>
      <SidebarIconItem
        className="mb-2 self-center"
        onClick={() => setSearchOpen(true)}
        aria-label="Search (⌘K)"
      >
        <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </SidebarIconItem>
    </TooltipTrigger>
    <TooltipContent side="right" sideOffset={8}>
      Search (⌘K)
    </TooltipContent>
  </Tooltip>
  <SidebarNav className="w-full items-center gap-1 pt-1">
    {items.map((item) => (
      <Tooltip key={item.href} delayDuration={0}>
        <TooltipTrigger asChild>
          <SidebarIconItem
            active={active(item.href)}
            aria-label={item.label}
            className="self-center"
            onClick={() => navigate(item.href)}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.5} />
          </SidebarIconItem>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    ))}
  </SidebarNav>
  <SidebarFooter className="flex w-full justify-center px-0">
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <span className="inline-flex">{avatar}</span>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {name}
      </TooltipContent>
    </Tooltip>
  </SidebarFooter>
</Sidebar>
```

Render expanded **or** collapsed regions from the same `collapsed` flag. One `Sidebar`. The flag is the animation.

Portaled UI (`CommandPalette`, dialogs) may be a sibling of these regions inside `Sidebar`. They leave the document via a portal and do not participate in the column.

---

## 8. Collapse, peek, overlay

Standard product shell: React state `collapsed` passed into `Sidebar`. A header button flips it. Motion is already on `Sidebar`.

`SidebarProvider` is for peek-on-hover, overlay mode, and resize. Use it when those behaviors are required. A normal app shell does not need a second sidebar context.

---

## 9. Mobile

Breakpoint: `768px`. Below that, the in-flow rail is omitted. The same sidebar component opens inside a left `Sheet`, always expanded (`collapsed={false}`).

```tsx excerpt:mobile-sheet-sidebar
<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
  <SheetContent
    side="left"
    className="w-[260px] max-w-[260px] border-0 bg-basalt-background p-0"
  >
    <SheetTitle className="sr-only">Navigation</SheetTitle>
    <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
  </SheetContent>
</Sheet>
```

`SheetContent` is already `h-full`. `Sidebar` still owns the 260px column inside it. Close the sheet on pathname change. While open, set `document.body.style.overflow = "hidden"` and clear it on close.

`AppHeader` `leading` is the menu button on mobile only (`Button variant="ghost" size="icon" className="h-8 w-8"`).

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
  const location = useLocation();
  const { theme } = useTheme();
  const crumbs = [{ href: "/", label: "Home" }];
  const title = "Projects";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <AppShell>
      <AppSkipLink>Skip to main content</AppSkipLink>
      {!isMobile ? (
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      ) : (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-[260px] max-w-[260px] border-0 bg-basalt-background p-0"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
      <AppMain>
        <AppHeader
          leading={
            isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu aria-hidden="true" />
              </Button>
            ) : null
          }
          breadcrumbs={crumbs}
          title={title}
          actions={<ThemeToggle aria-label={`Toggle theme (now ${theme})`} />}
        />
        <div className="flex min-h-0 flex-1 flex-col px-2 pb-2 md:px-3 md:pb-3">
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

`AppHeader` is `h-14`, matching `SidebarHeader`.

### AppHeader API & Contracts

`AppHeader` inherits root `header` attributes (`HTMLAttributes<HTMLElement>`).

- **`title?: string`**: Current page title rendered inside an `h1` (`truncate text-sm font-normal text-basalt-foreground`). (Source type intersection is `HTMLAttributes<HTMLElement> & { title?: ReactNode }`, which narrows valid `title` values to `string | undefined`). Do not also put the current page title in `breadcrumbs`.
- **`breadcrumbs?: { href?: string; label: ReactNode }[]`**: Ancestor breadcrumb hierarchy displayed before the current page title (ancestors only). Separated by ChevronRight.
- **`leading?: ReactNode`**: Optional slot before breadcrumbs, typically the mobile hamburger drawer trigger.
- **`actions?: ReactNode`**: Top-right framework controls (`ThemeToggle`, account dropdown, etc.). This slot is reserved for framework controls, **not** the page-level create button.
- **Native & Ref Boundary**: Inherits native `HTMLAttributes<HTMLElement>`, but does not forward ref.

Product title and version live in `SidebarHeader`, not in `AppHeader`. Read the version from the app `package.json` at build time. Do not hardcode it.

---

## 11. Login — badge card

Login is **not** inside `AppShell`. It is a centered badge on the full viewport.

Shape: ISO ID card, `aspect-[54/86]`, `w-72`, `rounded-2xl`, `bg-basalt-card`, layered shadow, hairline ring. Primary strip on top, mark and actions in the body, status strip pinned to the bottom.

```tsx excerpt:login-badge-page
export function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-basalt-background p-4">
      <div className="flex flex-col items-center">
        <div
          data-basalt-surface-root=""
          className="relative flex aspect-[54/86] w-72 flex-col overflow-hidden rounded-2xl bg-basalt-card ring-1 ring-black/[0.08] dark:ring-white/[0.06]"
          style={{
            boxShadow: [
              "0 1px 2px rgba(0,0,0,0.06)",
              "0 4px 8px rgba(0,0,0,0.04)",
              "0 12px 24px rgba(0,0,0,0.06)",
              "0 24px 48px rgba(0,0,0,0.04)",
              "0 0 0 0.5px rgba(0,0,0,0.02)",
              "0 0 60px rgba(0,0,0,0.03)",
            ].join(", "),
          }}
        >
          <div className="bg-basalt-primary px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-8 rounded-full bg-basalt-background/80" />
              <div className="flex items-center gap-2">
                <BasaltMark className="h-4 w-4 text-basalt-primary-foreground" />
                <span className="text-sm font-semibold text-basalt-primary-foreground">
                  Acme
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-widest text-basalt-primary-foreground/60 uppercase">
                Visitor
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center px-6 pt-6 pb-14">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-basalt-secondary p-2.5 ring-1 ring-basalt-border">
              <BasaltMark className="h-10 w-10 text-basalt-muted-foreground" />
            </div>
            <p className="mt-5 text-lg font-semibold text-basalt-foreground">Welcome</p>
            <p className="mt-1 text-xs text-basalt-muted-foreground">Sign in to continue</p>
            <div className="mt-5 h-px w-full bg-basalt-border" />
            <div className="flex-1" />
            <Button variant="secondary" className="w-full rounded-xl py-3">
              Continue
            </Button>
          </div>
          <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center border-t border-basalt-border bg-basalt-secondary/50 py-2.5">
            <span className="text-[10px] text-basalt-muted-foreground">Secure sign-in</span>
          </div>
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
- **`mark?: ReactNode`**: Centered brand mark slot. Defaults to `<BasaltMark className="h-8 w-8 text-basalt-foreground" />`. Note: passing children to `LoadingScreen` does not override this mark slot; custom brand icons must be provided via the `mark` prop.
- **Native & Ref Boundary**: Inherits standard `HTMLAttributes<HTMLDivElement>`. Overlays full viewport (`fixed inset-0 z-50 flex items-center justify-center bg-basalt-background`). Does not forward ref.

```tsx excerpt:loading-screen-snippet
<LoadingScreen label="Loading" />
```

---

## 13. First page

When skip link, rail (260 / 68, 300ms), header `h-14`, and island are in place, add routes as `Outlet` pages. Application pages inside the island start with `PageHeader`. The shell file does not grow with page UI.

Standalone login, loading, error, and landing pages use their own first-screen structure: `/login` preserves the visitor-badge composition, `/loading` is a named loading status, and `/404` and `/static-page` have independent headings. Library reference pages use their document heading and section navigation. These are deliberate layout exceptions, not alternate application-page templates.

The `/forms`, `/settings`, `/data`, and `/chat` examples demonstrate local state and simulated requests, including failure/retry and cancellation. Their viewmodels own data and timers; Views own native FormData, focus, and responsive layout. Replace the local service adapter when integrating a backend. Theme selection uses the shared provider; local profile, uploads, and chat changes do not update a real account.

`PageHeader` is flush on `ContentIsland`. Do not wrap it in another card. Do not put an icon row above the heading.

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
    <div className="space-y-8">
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
    <div className="space-y-8">
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
        <div className="grid grid-cols-2 gap-4">
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

| Where | Mark | Paint |
|---|---|---|
| L0 | `AppShell`, login viewport | `--basalt-background` 94% / 9% |
| L1 | `ContentIsland`, Dialog, Sheet, AlertDialog, login badge | `--basalt-card` 97% / 10.6% |
| L2 | first `LayerCard` under a root | `--basalt-secondary` 99% / 12.2% |
| L3 | `LayerCard.Well` or a nested `LayerCard` | `--basalt-bright` 100% / 14% |
| L3+ | deeper nested surface | transparent, no ring by default |
| Overlay | Tooltip, Popover, Dropdown, HoverCard | `--basalt-popover` — not a stack step |

`--basalt-muted` is not a content step. Isolated (no root): the outermost `LayerCard` paints as L1; its Well is L2.

`LayerCard.Primary` is `Well`. `LayerCard.Secondary` is `Header`. Keep the names; teach Header / Body / Well.

### Recipe

Unstructured card (KPI, metric, tile) — root padding, one surface:

```tsx excerpt:layercard-unstructured
<LayerCard>
  <p className="text-xs text-basalt-muted-foreground">Sessions</p>
  <p className="text-2xl font-semibold">1,284</p>
</LayerCard>
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
</LayerCard>
```

```tsx excerpt:layercard-structured-well
<LayerCard>
  <LayerCard.Header>Activity</LayerCard.Header>
  <LayerCard.Well>
    {/* lists, nested groups, inner frames */}
  </LayerCard.Well>
</LayerCard>
```

Place cards with Grid or flex. Those classes do not paint. A grid of `LayerCard` on the island is L2. A `LayerCard` inside a Well is L3+.

`outlined` draws a hairline when a transparent L3+ nest would otherwise vanish. Default grouping is luminance only.

### Controls and tables

Input, Select, secondary / outline Button use `bg-basalt-control` (`--basalt-control-fill` from the current surface) plus border. Do not override with `bg-card`, `bg-basalt-card`, or `bg-basalt-background`.

`Table` sets `data-basalt-table`. Zebra, hover, and selected paint on `td`, from `--basalt-zebra-fill` / `--basalt-control-fill`.

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

`PageHeader` and `SectionRule` are the only page-level chrome inside the island. Import them from granular paths. They are not on the root barrel. Do not wrap the title in an island.

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
/>
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
    <form onSubmit={handleSubmit}>
      <Field label="Email" hint="Your primary email address">
        <Input name="email" type="email" required />
      </Field>

      <Field label="Notifications">
        <Switch name="notifications" defaultChecked />
      </Field>

      <div className="flex gap-2 mt-4">
        <Button type="reset" variant="secondary">Reset</Button>
        <Button type="submit" variant="default">Save Changes</Button>
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
        keyboardInstructions:
          "Utilisez les flèches pour naviguer et Entrée pour valider.",
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
    <LayerCard className="max-w-md p-6">
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <div data-testid="submission-output" className="text-sm font-mono p-2 border rounded">
          Submitted: {JSON.stringify(submittedData)}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleControlledReset}
        >
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
   bun add @nocoo/basalt lucide-react
   ```
2. **Step 2: Configure Stylesheet & Scan Sources**
   - In Tailwind v4 setups, configure CSS imports with `@source` scanning `dist`:
     ```css
     @source "../node_modules/@nocoo/basalt/dist/**/*.{js,jsx,ts,tsx}";
     @import "@nocoo/basalt/styles/tailwind";
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
   - Import chart components from `@nocoo/basalt/charts/*` (ensure `recharts` peer dependency is installed).
5. **Step 5: Verify Contrast, Surface Tokens & Form Handling**
   - Verify all content cards use `LayerCard` or surface classes rather than manual border/background combinations.
   - For composite forms (`DatePicker`, `Autocomplete`), implement controlled state or wrap in form library Controllers (e.g. `react-hook-form`).
---

## 18. Chart Subsystem Primitives

Basalt charts are composed of responsive frame, legend, and tooltip subsystem primitives. Consuming applications import these granularly from `@nocoo/basalt/charts/*`.

<a id="chart-frame"></a>

### ChartFrame & ChartShell (`@nocoo/basalt/charts/frame`)

- **`ChartFrame`**: Responsive container wrapper around Recharts `ResponsiveContainer`.
  - **Props (`ChartFrameProps`)**:
    - `ariaLabel: string` (required): Accessible name for chart graphic. Container element receives `role="group"` and `aria-label={ariaLabel}`.
    - `children: ReactElement<{ accessibilityLayer?: boolean; "aria-label"?: string; "aria-describedby"?: string }>` (required): Single child Recharts graphic element. Precedence: explicit child `accessibilityLayer` prop takes priority, followed by the wrapper prop, falling back to `true`.
    - `size?: string` (optional, default: `"h-36 w-56"`): Tailwind sizing utility classes for the plot surface container.
    - `className?: string` (optional): Additional styles applied to the chart container.
    - `summary?: ReactNode` (optional): Descriptive text summarizing key data points and keyboard navigation instructions. Automatically associated with the chart and outer group via `useId` and `aria-describedby`.
    - `dataAlternative?: ReactNode` (optional): Accessible tabular or structured data alternative rendered outside the fixed-size plot area.
    - `accessibilityLayer?: boolean` (optional, default: `true`): Explicit toggle for keyboard accessibility on the underlying Recharts graphic where supported by the specific chart type. Callers that explicitly disable `accessibilityLayer`, or render non-interactive compact/decorative charts without tooltip exploration (such as Sparkline or SlotBar), must provide a `summary` or `dataAlternative` textual replacement.
  - **Native & Ref Boundary**: Pure React functional wrapper. Does not forward ref or forward arbitrary div rest props.
- **`ChartShell`**: Composite container pairing a `ChartFrame` graphic area above a flexible `legend` slot.
  - **Props (`ChartShellProps`)**: Extends `ChartFrameProps` with optional `legend?: ReactNode`.
- **`ChartAccessibilityProps`**: Utility type `Pick<ChartFrameProps, "summary" | "dataAlternative" | "accessibilityLayer">` exported for chart wrappers providing accessible summaries and data alternatives.

<a id="chart-legend"></a>

### ChartLegend (`@nocoo/basalt/charts/legend`)

- **`ChartLegend`**: Custom chart legend layout supporting multiple series shapes.
  - **Props**:
    - `items: ChartSeriesDescriptor[]` (required): Mutable series descriptors array `{ key: string, label?: string, color?: string }[]`. Note: type requires mutable array (not `readonly`). If empty, returns `null`.
    - `shape?: "bar" | "line" | "area"` (optional, default: `"line"`): Indicator swatch shape.
  - **Behavior**: Uses `seriesColor(item, index)` to compute indicator fills, falling back to `hsl(var(--basalt-chart-1))` if undefined. Does not forward ref.

<a id="chart-tooltip"></a>

### ChartTooltipContent & formatChartNumber (`@nocoo/basalt/charts/tooltip`)

- **`ChartTooltipContent`**: Popover tooltip body rendered inside Recharts `<Tooltip content={...} />`. Returns `null` (no output) when `active` is not true or when `payload` is empty/undefined.
  - **Props**:
    - `active?: boolean`: Active hover state supplied by Recharts.
    - `payload?: readonly ChartTooltipItem[]`: Hovered item collection.
    - `label?: string | number`: Tooltip title or category label.
    - `formatter?: (value: number) => string`: Custom numeric formatter for data values. Defaults to `formatChartNumber`.
  - **`ChartTooltipItem` Shape**:
    - `name?: string`: Series name or identifier.
    - `value?: number | string`: Numerical or string value of the hovered point.
    - `color?: string`: Item color indicator.
    - `fill?: string`: SVG fill color indicator.
    - `stroke?: string`: SVG stroke color indicator.
    - `dataKey?: string | number`: Recharts series key binding.
  - **Behavior**: Hides row label text for internal/synthetic keys (`"y"`, `"y2"`, `"y3"`, `"value"`, `"target"`), but still displays their numeric values. Uses `--basalt-popover` background tokens with tabular numeric formatting.
- **Composable Tooltip Elements**: Lightweight, zero-Recharts presentation primitives for building custom tooltip layouts. All three components forward native host element props (such as `id`, `aria-*`, `data-*`, style, and event listeners) and preserve custom caller style overrides while omitting `children` to avoid silent element drops:
  - **`ChartTooltipRow`**: Renders an individual metric row with color dot indicator, series label, and formatted tabular numeric value with optional unit.
    - `label?: ReactNode`: Metric or series title (preserves numeric `0` and custom nodes; nullish values omit the label element).
    - `value?: ReactNode`: Metric value. Finite numbers are automatically formatted via `formatter` or `formatChartNumber`. `null` or `undefined` renders placeholder `"—"`.
    - `unit?: ReactNode`: Optional unit string or node (e.g., `"ms"`, `"req/s"`, `"%"`) appended to the value. Omitted when `value` evaluates to placeholder `"—"`.
    - `color?: string`: Swatch dot fill color (defaults to `hsl(var(--basalt-chart-1))`).
    - `formatter?: (value: number) => string`: Optional custom numeric formatter overriding `formatChartNumber`.
    - `hideIndicator?: boolean`: When true, suppresses rendering of the decorative color dot (default: `false`).
    - Forwarded native props: Accepts `Omit<ComponentProps<"div">, "children">`.
  - **`ChartTooltipDivider`**: Renders a horizontal divider rule as a native `<hr>` element (`role="separator"`, `aria-orientation="horizontal"`) with zero borders and explicit 1px height for grouping metric categories.
    - Forwarded native props: Accepts `Omit<ComponentProps<"hr">, "children">`.
  - **`ChartTooltipSummary`**: Renders an aggregated metric row (e.g. Total or SLA Ceiling) with bold font weights and optional unit suffix.
    - `label?: ReactNode`: Summary title (defaults to `"Total"`, preserves numeric `0`).
    - `value?: ReactNode`: Aggregated value node. Finite numbers are formatted; nullish renders placeholder `"—"`.
    - `unit?: ReactNode`: Optional unit suffix appended to valid summary values (omitted for `"—"`).
    - `formatter?: (value: number) => string`: Optional custom numeric formatter.
    - Forwarded native props: Accepts `Omit<ComponentProps<"div">, "children">`.
- **`formatChartNumber(value: number): string`**: Formats numbers via `Intl.NumberFormat` with max 0 decimals for integers and 1 decimal for fractions. Non-finite values return `"—"`.

<a id="heatmap-calendar"></a>

### HeatmapCalendar (`@nocoo/basalt/charts/heatmap-calendar`)

- **`HeatmapCalendar`**: Accessible calendar heatmap component supporting both year-long date/value grids and compact 7-column numeric sequences.
  - **Props (`HeatmapCalendarYearProps`)**:
    - `data: HeatmapDataPoint[]` (required): Daily entries `{ date: string, value: number }[]` with ISO date strings (`"YYYY-MM-DD"`).
    - `year: number` (required): Target calendar year to render.
    - `colorScale?: readonly string[]` (optional): Array of colors forming intensity gradient. Defaults to `heatmapColorScales.green`.
    - `valueFormatter?: (value: number, date: string) => string` (optional): Formatting function for tooltip and accessible name.
    - `metricLabel?: string` (optional, default: `"Value"`): Label for the measured metric.
    - `cellSize?: number` (optional, default: `12`): Width and height of day cells in pixels.
    - `cellGap?: number` (optional, default: `2`): Gap between cells in pixels.
    - `locale?: string` (optional, default: `"en-US"`): BCP 47 locale for month/weekday labels.
    - `weekdayLabels?: string[]` / `monthLabels?: string[]` (optional): Explicit label overrides.
    - `lessLabel?: string` / `moreLabel?: string` (optional, default: `"Less"` / `"More"`): Legend bounds text.
    - `ariaLabel?: string` (optional, default: `"Heatmap calendar"`): Accessible name for the calendar view.
    - `className?: string` (optional): Additional styles applied to the scrollable wrapper.
  - **Props (`HeatmapCalendarValuesProps`)**:
    - `values: number[]` (required): Sequence of values rendered in a compact 7-column matrix with zero-value contrast preservation.
    - `ariaLabel?: string` (optional, default: `"Heatmap calendar"`): Accessible name for the matrix.
    - `className?: string` (optional): Additional styles.
  - **Keyboard Navigation & Single Tab Stop**:
    - Focus enters the heatmap via a single <kbd>Tab</kbd> stop onto the active day/value cell button.
    - **Year Grid Navigation**:
      - <kbd>↑</kbd> / <kbd>↓</kbd>: Navigate vertically between days (previous/next day, ±1 day).
      - <kbd>←</kbd> / <kbd>→</kbd>: Navigate horizontally between weeks (previous/next week, ±7 days).
      - <kbd>Home</kbd> / <kbd>End</kbd>: Jump directly to the first/last valid day of the year.
      - <kbd>Escape</kbd>: Dismisses the day tooltip while preserving focus on the cell button.
      - <kbd>Tab</kbd>: Leaves the calendar directly to the next external focusable control (no 365-stop tab trap).
    - **Values Matrix Navigation**:
      - <kbd>←</kbd> / <kbd>→</kbd>: Step ±1 item in sequence.
      - <kbd>↑</kbd> / <kbd>↓</kbd>: Step ±7 items (previous/next row in the same column in 7-column layout).
      - <kbd>Home</kbd> / <kbd>End</kbd>: Jump to first/last value.
      - <kbd>Escape</kbd>: Dismisses value tooltip while preserving focus on the cell button.
      - <kbd>Tab</kbd>: Leaves the matrix directly to the next external focusable control.
      - Zero values render with clear `:focus-visible` outlines without being faded by parent opacity.
    - **Dynamic Data Updates**: Shrinking or emptying arrays, or switching years, clamps active index safely, restores focus if the element was active, and never steals focus from external controls.

<a id="heatmap-matrix"></a>

### HeatmapMatrix (`@nocoo/basalt/charts/heatmap-matrix`)

- **`HeatmapMatrix`**: Generic two-dimensional intensity matrix for tabular categorical, operational, and schedule telemetry (e.g. days vs hours, regions vs services).
  - **Props (`HeatmapMatrixProps`)**:
    - `rowLabels: readonly string[]` (required): Ordered row headers.
    - `columnLabels: readonly string[]` (required): Ordered column headers.
    - `values: readonly (readonly (number | null | undefined)[])[]` (required): 2D matrix of values. Supports ragged rows, null, undefined, and non-finite values (treated as missing). Numeric `0` is a valid reading and distinct from missing data.
    - `domain?: readonly [min: number, max: number]` (optional): Explicit [min, max] domain for color intensity scaling. If reversed [max, min], bounds are automatically normalized to [min, max]; if equal [v, v], values <= v receive level 0 while values > v receive highest level. If non-finite or omitted, dynamically derived solely from visible finite numeric cells in the dataset (or [0, 0] if no finite values exist). Values at or below min receive level 0; values >= max clamp to the highest level.
    - `colorScale?: readonly string[]` (optional, default: `heatmapColorScales.green`): Color intensity levels array. If empty or single-color, gracefully resolves to base level.
    - `valueFormatter?: (value: number) => string` (optional, default: `(v) => v.toLocaleString()`): Formatter for numeric values.
    - `missingLabel?: string` (optional, default: `"—"`): Text representation for missing, null, undefined, or non-finite readings.
    - `metricLabel?: string` (optional, default: `"Heatmap matrix"`): Metric label for accessible descriptions.
    - `ariaLabel?: string` (optional, default: `"Heatmap matrix"`): Accessible name for the grid region.
    - `cellSize?: number` (optional, default: `16`): Cell height (and default width) in pixels.
    - `columnWidth?: number` (optional): Cell and column width in pixels. When omitted, falls back to `cellSize` for square cells. Allows wider rectangular cells to fit readable column headers (e.g. timestamps or service names).
    - `cellGap?: number` (optional, default: `2`): Gap between adjacent cells in pixels.
    - `lessLabel?: string` / `moreLabel?: string` (optional, default: `"Less"` / `"More"`): Legend bounds text.
    - `showLegend?: boolean` (optional, default: `true`): Whether to display the bottom color intensity scale legend.
    - `renderTooltip?: (cell: HeatmapMatrixCellContext) => ReactNode` (optional): Custom cell popover tooltip renderer. Replaces default tooltip contents while integrating composable parts (`ChartTooltipRow`, `ChartTooltipDivider`, `ChartTooltipSummary`).
    - Native props: Forwards `Omit<ComponentProps<"div">, "children">` and React 19 callback ref with cleanup to the root container.
  - **Keyboard Navigation & ARIA Semantics**:
    - Complete `role="grid"` structure with table headers (`columnheader`, `rowheader`) and cells (`gridcell`).
    - Single roving <kbd>Tab</kbd> stop onto the active cell.
    - Directional keys <kbd>←</kbd> / <kbd>→</kbd> navigate columns; <kbd>↑</kbd> / <kbd>↓</kbd> navigate rows.
    - <kbd>Home</kbd> / <kbd>End</kbd> jump to the first/last column of the current row; <kbd>PageUp</kbd> / <kbd>PageDown</kbd> jump to the first/last row of the current column.
    - <kbd>Escape</kbd> dismisses open cell tooltips while preserving cell focus.
    - Mobile horizontal scrolling: wide grids scroll horizontally without document overflow, keeping active cells visible during keyboard navigation.
    - Focus stability: shrinking or emptying matrix dimensions clamps active indices without stealing focus from external elements.

<a id="stat-card"></a>

### StatCard & StatGrid (`@nocoo/basalt/charts/stat-card`)

- **`StatCard`**: High-level KPI and telemetry presentation card supporting incremental interactive slots and status state transitions.
  - **Props (`StatCardProps`)**:
    - `value: string | number` (required): Core metric value. Formatted via `toLocaleString()` if numeric. Overridden when `status` is provided.
    - `title?: string` / `label?: string` (optional): Heading text (`title` takes precedence over `label`).
    - `subtitle?: string` (optional): Supporting text below value.
    - `icon?: LucideIcon` (optional): Decorative icon displayed in header.
    - `iconColor?: string` (optional, default: `"text-basalt-muted-foreground"`): Tailwind text color class for icon.
    - `trend?: { value: number; label?: string }` (optional): Default percentage trend with automatic positive/negative color coding.
    - `action?: ReactNode` (optional): Header interactive element (e.g., info tooltip button). When provided, switches card role to `group`.
    - `status?: ReactNode` (optional): State replacement slot (e.g., loading skeleton, error message, or empty indicator) replacing the numeric `value`. Does not mask caller-managed `subtitle` or `trend`. When callers display an error or empty state, they should omit `trend` so stale metrics are not reported.
    - `trendContent?: ReactNode` (optional): Custom trend replacement slot (e.g., custom badge, sparkline, or localized text) replacing default `trend`.
    - `children?: ReactNode` (optional): Custom arbitrary content rendered inside the card below header.
    - `ariaLabel?: string` (optional): Overrides automatic accessible name calculation.
    - `className?: string` (optional): Additional container classes.
  - **Accessibility & Role Semantics**:
    - Pure display cards render as `role="img"` with an automated compound accessible label.
    - When `action`, `status`, `trendContent`, or `children` slots are present, the card switches to `role="group"` so interactive descendants remain discoverable and navigable in assistive technology trees.
    - Falsy values `null`, `undefined`, and `false` are cleanly disregarded without creating empty gap wrappers; `0` is treated as valid content.
- **`StatGrid`**: Responsive grid container organizing multiple `StatCard` items into 2, 3, or 4 column layouts.
  - **Props (`StatGridProps`)**: `columns?: 2 | 3 | 4` (default: `4`), `className?: string`, `children: ReactNode`.

<a id="dynamic-chart-series"></a>

### Dynamic Chart Series & Multi-Key Datasets (`@nocoo/basalt/charts/*`)

Basalt cartesian charts (`LineChart`, `AreaChart`, `BarChart`, `StackedBarChart`, `GroupedBarChart`, `Charts`, `Timeseries`, `CustomChart`, `Sparkline`, and `SlotBarChart`) support arbitrary, type-safe data keys beyond the legacy `y`, `y2`, and `y3` series convention:

- **Generic Data Binding**:
  - `data: TData[]`: Generic record where `TData extends { x: string | number }`. Caller datasets can contain any number of arbitrary metric keys (e.g., `edgeCache`, `p95US`, `workersCPU`), nullable numbers (`number | null`), and optional numeric properties (`number | undefined`).
  - `series?: Array<ChartSeriesDescriptor<K>>`: Strongly-typed array of series descriptors. Series keys `K` are automatically constrained to `LineChartNumericKeys<TData>` (excluding coordinate `x` and rejecting non-numeric fields such as strings, booleans, or typos). Arbitrary keys require explicit series; omitted or empty series retain each chart's legacy `y`, `y2`, and `y3` series fallback. Note that TypeScript type inference does not automatically enumerate object keys at runtime.
  - Backward compatibility: Defaults to `XYPoint` (`{ x, y, y2?, y3? }`) with `XYSeriesDescriptor` when generic parameters are omitted.
- **Enhanced Axis & Formatting Props** (available on full plot charts: `LineChart`, `AreaChart`, `BarChart`, `StackedBarChart`, `GroupedBarChart`, `Charts`, `Timeseries`, `CustomChart`):
  - `xValueFormatter?: (value: string | number) => string`: Formats category or time tick labels along the X-axis.
  - `valueFormatter?: (value: number) => string`: Formats numeric Y-axis tick values and fallback tooltip values.
  - `yDomain?: LineChartAxisDomain`: Custom numerical bounds or keywords (`"auto"`, `"dataMin"`, `"dataMax"`) for the Y-axis.
- **Stacking & Composition** (compact charts `Sparkline` and `SlotBarChart` intentionally retain compact geometry without axis, legend, or tooltip layers):
  - `stackOffset?: "none" | "expand" | "wiggle" | "silhouette"`: Stacking algorithm for `AreaChart` and `StackedBarChart`. Setting `"expand"` normalizes values to 100% proportional areas/bars.
  - `legend?: ReactNode | ((props: { items: Array<ChartSeriesDescriptor<K>> }) => ReactNode)`: Replaces default legend with custom JSX or an interactive render function receiving resolved series descriptors. Falsy values `null`, `undefined`, and `false` are omitted while `0` is preserved as valid content.
  - `customTooltip?: (props: { active?: boolean; payload?: readonly ChartTooltipItem[]; label?: string | number }) => ReactNode`: Custom popover tooltip renderer receiving Recharts payload, hover state, and coordinate label for custom unit and percentage calculations.

---

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
      <div className="min-h-screen bg-basalt-background text-basalt-foreground p-6 space-y-6">
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
            <div className="flex gap-3 max-w-md">
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

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
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
      <div className="p-6 space-y-4">
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
            <div className="mt-4">
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
        <nav className="flex gap-4 p-4 border-b border-basalt-border">
          <NavigationItem href="/dashboard">Dashboard</NavigationItem>
          <NavigationItem href="/settings">Settings</NavigationItem>
          <NavigationItem href="https://docs.hexly.ai">External Docs</NavigationItem>
        </nav>
        <div className="p-4">
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
    <LinkComponent href={href} className="text-sm font-medium hover:underline text-basalt-foreground">
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
    setFeedback(`Saved preferences for ${username} (alerts: ${emailAlerts ? "enabled" : "disabled"})`);
  };

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    setFeedback("Form reset to default values");
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4 max-w-sm">
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

      <div className="flex gap-2">
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

