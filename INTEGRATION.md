# Basalt application chrome

This is the one-pass setup for a Basalt app. Read it before writing layout. After this chrome is in place, every feature is a page inside `ContentIsland`.

The library owns the rail, the main column, collapse motion, and the island. The app owns navigation data, brand, and page bodies.

Package: `@nocoo/basalt`. React 19. Tailwind v4.

---

## 1. Goal

Ship three surfaces, in this order:

1. **Providers + CSS** — theme, links, tooltips, tokens.
2. **Login** — full-viewport badge card. No shell.
3. **App shell** — skip link, sidebar rail, header, content island.

Do not start page work until the shell matches the trees in this file.

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
| `@nocoo/basalt` | `Button`, `Sidebar`, `SidebarHeader`, `SidebarNav`, `SidebarFooter`, `SidebarItem`, `SidebarIconItem`, `SidebarPartition`, `SidebarGroup`, `SidebarSearch`, `SidebarUser`, `ContentIsland`, `Sheet`, `SheetContent`, `SheetTitle`, `Avatar`, `AvatarFallback`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, `ThemeProvider`, `LinkProvider`, `Toaster`, `CommandPalette`, … |
| `@nocoo/basalt/components/app-shell` | `AppShell`, `AppMain`, `AppSkipLink` |
| `@nocoo/basalt/components/app-header` | `AppHeader` |
| `@nocoo/basalt/components/loading-screen` | `LoadingScreen` |
| `@nocoo/basalt/components/basalt-mark` | `BasaltMark` |
| `@nocoo/basalt/components/theme-toggle` | `ThemeToggle` |
| `@nocoo/basalt/providers/theme` | `useTheme` (if not taking `ThemeProvider` from the root) |
| `@nocoo/basalt/charts/*` | charts |
| `@nocoo/basalt/components/date-picker` | DatePicker |
| `@nocoo/basalt/components/data-table` | DataTable |

`AppShell`, charts, DatePicker, and DataTable stay off the root barrel.

---

## 4. Provider tree

One tree for the whole app. Login and the shell both sit under it.

```tsx
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

`AccentProvider` is optional.

---

## 5. Color and type

Every chrome class uses the `basalt-` prefix:

- surfaces: `bg-basalt-background` (L0), `bg-basalt-card` (L1 island), `bg-basalt-secondary` (L2 card), `bg-basalt-bright` (L3 well), `bg-basalt-control` (current-surface controls), `bg-basalt-primary`, `bg-basalt-accent`
- nest: `ContentIsland` / Dialog / Sheet set `data-basalt-surface-root`. `LayerCard` and `LayerCard.Well` set `data-basalt-surface`. Do not hand-write `bg-card` wells inside the island.
- text: `text-basalt-foreground`, `text-basalt-muted-foreground`, `text-basalt-primary-foreground`
- line: `ring-basalt-border`, `border-basalt-border`

Icons: `lucide-react`, `strokeWidth={1.5}`, nav size `h-4 w-4 shrink-0`.

---

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

`AppMain` always gets `tabIndex={-1}`. `AppSkipLink` targets `#main-content` (already on `AppMain`).

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

`SidebarHeader` already pads horizontally. Brand, version pill, and collapse control go **directly** in it.

Nav labels use `SidebarPartition`. The item stack is **one** `px-3` column (the same gutter `SidebarGroup` uses). `SidebarItem` already has its own `px-3`. That is the whole horizontal rhythm: partition at 24px, item content at 24px.

Collapsible sections use `SidebarGroup` instead of Partition + stack. `SidebarGroup` already includes the item gutter. Do not add another `px-3` around it.

```tsx
<Sidebar collapsed={collapsed}>
  <SidebarHeader>
    <div className="flex w-full items-center justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <BasaltMark className="h-5 w-5 shrink-0" />
        <span className="truncate text-lg font-semibold text-basalt-foreground md:text-xl">
          Acme
        </span>
        <span className="shrink-0 rounded-md bg-basalt-secondary px-1.5 py-0.5 text-[10px] leading-none font-medium text-basalt-muted-foreground">
          v1.0.0
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

```tsx
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

```tsx
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

```tsx
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

```tsx
export function AppFrame() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

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
      <AppMain tabIndex={-1}>
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

`AppHeader` is `h-14`, matching `SidebarHeader`. Breadcrumbs are ancestors only; `title` is the current page. Do not repeat the current page in both.

---

## 11. Login — badge card

Login is **not** inside `AppShell`. It is a centered badge on the full viewport.

Shape: ISO ID card, `aspect-[54/86]`, `w-72`, `rounded-2xl`, `bg-basalt-card`, layered shadow, hairline ring. Primary strip on top, mark and actions in the body, status strip pinned to the bottom.

```tsx
export function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-basalt-background p-4">
      <div className="flex flex-col items-center">
        <div
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

## 12. Loading

Boot and route gates use `LoadingScreen` — a centered mark and a 6rem shimmer bar on `bg-basalt-background`. It is a full-viewport status, not a child of the island.

```tsx
<LoadingScreen label="Loading" />
```

---

## 13. After the chrome

When skip link, rail (260 / 68, 300ms), header `h-14`, and island are in place:

- add routes as `Outlet` pages
- compose Basalt leaves (`Table`, `Button`, `Field`, charts, …) inside the island
- keep view-models free of layout chrome

The shell file should not grow with page UI. Navigation items are data. Pages are data + controls.