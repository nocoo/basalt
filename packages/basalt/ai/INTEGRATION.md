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

Tailwind v4 only. In the app stylesheet, this order is required. The `@source` path is relative to **this CSS file** and must hit `node_modules/@nocoo/basalt/dist`:

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

Without Tailwind, import `@nocoo/basalt/styles/standalone` instead. Standalone has no Preflight; still set `html, body, #root { height: 100% }`.

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

<a id="accent-provider"></a>

### AccentProvider and useAccent

`AccentProvider` manages dynamic primary accent color overrides (`--basalt-primary`, `--basalt-primary-foreground`, `--basalt-ring`, and `dataset.accent`) using `localStorage` (key: `"basalt-accent"`, default `"primary"`). It does not alter chart palette tokens (`--basalt-chart-*`).

- **Props**: `{ children: ReactNode }`.
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
  - `accentForeground(hsl: string): string`: Computes relative luminance from HSL channels and selects dark foreground (`"0 0% 10%"`) when luminance > 0.35, otherwise light (`"0 0% 100%"`). Note: currently relies on a fixed 0.35 luminance threshold rather than comparing WCAG contrast ratios directly (slated for full contrast verification in P5).
  - `applyAccent(id: string, dark = false): void`: Sets CSS variables `--basalt-primary`, `--basalt-primary-foreground`, `--basalt-ring`, and `dataset.accent` on the document root element. Accepts optional `dark` flag (defaults to `false`).
- **Known Limitations**: Storage access uses browser `localStorage`. Disallowed or sandboxed storage environments can throw on read or write (slated for graceful fallback hardening in P4). SSR hydration serves server snapshot defaults (`DEFAULT_ACCENT_ID = "primary"`).




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

When skip link, rail (260 / 68, 300ms), header `h-14`, and island are in place, add routes as `Outlet` pages. Every page starts with `PageHeader`. The shell file does not grow with page UI.

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

When using controlled state or building custom form adapters, `DatePicker` accepts an ISO date string (`YYYY-MM-DD`):

```tsx compile:integration-controlled-date-picker
import { useState } from "react";
import { DatePicker } from "@nocoo/basalt/components/date-picker";

export function ControlledDatePickerField() {
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-01");

  return (
    <DatePicker
      value={selectedDate}
      onChange={setSelectedDate}
      aria-label="Target Date"
    />
  );
}
```

### Known Form Limitations
1. `DatePicker` external ref merging: forwarding a custom `ref` currently overrides internal hidden input ref bindings, which impairs form reset behavior.
2. `Autocomplete` free-text commit on blur: committing unselected free text triggers an unconditional focus call, preventing natural Tab navigation.
3. Native `required` validation on composite controls: empty required `DatePicker` inputs focus a 1×1px hidden element rather than the visible trigger button.

---

## 17. Step-by-Step Migration Guide

### Migrating to `@nocoo/basalt`

1. **Step 1: Install Package & Peer Dependencies**
   ```bash
   bun add @nocoo/basalt lucide-react
   ```
2. **Step 2: Configure Stylesheet**
   - Replace old CSS declarations with the strict 3-line Tailwind contract (§2) or import `@nocoo/basalt/styles/standalone`.
   - Remove custom `--color-*` or `--basalt-*` overrides in app CSS.
3. **Step 3: Establish Outer Frame**
   - Wrap application routes in `ThemeProvider` and `LinkProvider`.
   - Implement `/login` as an isolated badge page outside `AppShell`.
   - Use `AppShell` with `Sidebar` and `AppHeader` for authenticated layout.
4. **Step 4: Update Component Imports**
   - Import base components from `@nocoo/basalt` root.
   - Import layout chrome (`PageHeader`, `SectionRule`, `AppHeader`, `AppShell`) from granular subpaths (`@nocoo/basalt/components/*`).
   - Import chart components from `@nocoo/basalt/charts/*`.
5. **Step 5: Verify Contrast & Surface Tokens**
   - Verify all content cards use `LayerCard` or surface classes rather than manual border/background combinations.
---

## 18. Chart Subsystem Primitives

Basalt charts are composed of responsive frame, legend, and tooltip subsystem primitives. Consuming applications import these granularly from `@nocoo/basalt/charts/*`.

<a id="chart-frame"></a>

### ChartFrame & ChartShell (`@nocoo/basalt/charts/frame`)

- **`ChartFrame`**: Responsive container wrapper around Recharts `ResponsiveContainer`.
  - **Props**:
    - `ariaLabel: string` (required): Accessible name for chart graphic. Container element receives `role="img"` and `aria-label={ariaLabel}`.
    - `children: ReactElement<{ accessibilityLayer?: boolean }>` (required): Single child Recharts graphic element. `ChartFrame` explicitly clones this element with `accessibilityLayer: false`. Note: `role="img"` provides an image accessible name, but does not provide complete interactive chart accessibility (slated for P5).
    - `size?: string` (optional, default: `"h-36 w-56"`): Tailwind sizing utility classes.
    - `className?: string` (optional): Additional styles applied to the outer chart wrapper.
  - **Native & Ref Boundary**: Pure React functional wrapper. Does not forward ref or forward arbitrary div rest props.
- **`ChartShell`**: Composite container pairing a `ChartFrame` graphic area above a flexible `legend` slot.
  - **Props**: Extends `ChartFrameProps` with optional `legend?: ReactNode`.

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
- **`formatChartNumber(value: number): string`**: Formats numbers via `Intl.NumberFormat` with max 0 decimals for integers and 1 decimal for fractions. Non-finite values return `"—"`.

