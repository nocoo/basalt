# Application recipes

These complete modules use only public Basalt imports and React. AppFrame, Login and Resources are available since v2.1.0; MobileLayout requires v2.2.0.

Load exactly one CSS mode at the application entry: import `@nocoo/basalt/styles/standalone` for a build without Tailwind, or configure the Tailwind source scan and import `@nocoo/basalt/styles/tailwind` as described in INTEGRATION.md. In Next, import CSS in the root layout and import these modules through a `use client` boundary. Mount ThemeProvider once per application; the standalone recipes include their own root provider. Root pages should set body margin to zero.

Replace the local adapters with application routing, authentication and data services. Basalt does not own permissions, backend URLs, credentials, or persistence. The exact modules below are extracted from the installed tarball and exercised in A/B/Next consumers.

## AppFrame

Desktop navigation stays in flow; below 768 CSS pixels it becomes a named drawer. Closing or selecting a section restores the menu control. The media listener is removed on unmount.

```tsx compile:recipe-app-frame
import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button } from "@nocoo/basalt/components/button";
import { DialogDescription, DialogTitle } from "@nocoo/basalt/components/dialog";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { ContentIsland, Sidebar, SidebarHeader, SidebarItem, SidebarNav, SidebarProvider } from "@nocoo/basalt/components/sidebar";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { useEffect, useState } from "react";

export default function AppFrameRecipe() {
  const [page, setPage] = useState("Projects");
  const [compact, setCompact] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const update = () => { setCompact(media.matches); setCollapsed(media.matches); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  // Replace this local state change with your router's navigation adapter.
  function navigate(next: string) { setPage(next); if (compact) setCollapsed(true); }
  return <ThemeProvider>
    <SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed} overlay={compact}>
      {/* One bounded viewport; the island below owns its own scrolling. */}
      <AppShell layout="workspace" className="h-dvh">
        <AppSkipLink href="#recipe-main">Skip to content</AppSkipLink>
        <Sidebar>
          {compact && <><DialogTitle className="sr-only">Workspace navigation</DialogTitle><DialogDescription className="sr-only">Choose an application section.</DialogDescription></>}
          <SidebarHeader><strong>Atlas workspace</strong></SidebarHeader>
          <SidebarNav aria-label="Workspace navigation">
            {["Projects", "Members", "Activity"].map((name) => <SidebarItem key={name} active={page === name} onClick={() => navigate(name)}>{name}</SidebarItem>)}
          </SidebarNav>
        </Sidebar>
        <AppMain id="recipe-main" tabIndex={-1}>
          <AppHeader leading={<Button size="sm" variant="ghost" aria-label="Toggle navigation" onClick={() => setCollapsed(!collapsed)}>Menu</Button>} actions={<ThemeToggle aria-label="Change theme" />} />
          <ContentIsland className="space-y-basalt-layout-lg">
            <PageHeader title={page} description="A reusable application frame with responsive navigation." />
            <p role="status" className="text-basalt-sm text-basalt-muted-foreground">Opened {page}. Your application supplies routes and page content.</p>
          </ContentIsland>
        </AppMain>
      </AppShell>
    </SidebarProvider>
  </ThemeProvider>;
}
```

## Login

Native validation and FormData feed an application-supplied async authenticator. Failed authentication retains the form. Repeated submits are blocked and unmount aborts the request; the application owns the success transition and session.

```tsx compile:recipe-login
import { Button } from "@nocoo/basalt/components/button";
import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { useEffect, useRef, useState } from "react";

type Credentials = { email: string; password: string };
export function LoginForm({ authenticate, onSuccess }: {
  authenticate: (credentials: Credentials, signal: AbortSignal) => Promise<void>;
  onSuccess: (email: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  return <form aria-label="Sign in" className="space-y-basalt-space-lg" onSubmit={async (event) => {
    event.preventDefault();
    if (active.current) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const controller = new AbortController();
    active.current = controller; setPending(true); setError("");
    try {
      await authenticate({ email, password }, controller.signal);
      if (!controller.signal.aborted) onSuccess(email);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Sign in failed. Try again.");
    } finally {
      if (!controller.signal.aborted) { active.current = null; setPending(false); }
    }
  }}>
    <Field label="Email"><Input name="email" type="email" autoComplete="username" required /></Field>
    <Field label="Password"><SensitiveInput name="password" autoComplete="current-password" revealLabel="Show password" hideLabel="Hide password" required /></Field>
    {error && <p role="alert" className="text-basalt-sm text-basalt-destructive">{error}</p>}
    <Button className="w-full" type="submit" loading={pending}>Sign in</Button>
  </form>;
}

// The documented visitor badge: a full-viewport root, a primary strip, the body,
// and a status footer. It never enters AppShell, and the body grows with the form.
export default function LoginRecipe() {
  const [account, setAccount] = useState<string | null>(null);
  return <ThemeProvider>
    <main className="flex min-h-dvh items-center justify-center bg-basalt-background p-basalt-space-lg">
      <div data-basalt-surface-root="" className="flex w-72 max-w-full flex-col overflow-hidden rounded-basalt-lg bg-basalt-card ring-1 ring-basalt-border">
        <div className="flex items-center justify-between gap-basalt-space-lg bg-basalt-primary px-basalt-space-lg py-basalt-space-lg">
          <span className="text-basalt-base font-semibold text-basalt-primary-foreground">Atlas</span>
          <span className="text-basalt-xs font-medium uppercase tracking-widest text-basalt-primary-foreground/80">Visitor</span>
        </div>
        <div className="flex flex-1 flex-col gap-basalt-space-lg px-basalt-space-lg py-basalt-space-lg">
          <div className="space-y-basalt-space-sm">
            <h1 className="text-basalt-xl font-semibold text-basalt-foreground">Welcome to Atlas</h1>
            <p className="text-basalt-sm text-basalt-muted-foreground">Local sign-in demo. Use password demo-pass.</p>
          </div>
          {account ? <><p role="status" className="text-basalt-sm text-basalt-foreground">Signed in as {account}</p>
            <Button variant="outline" onClick={() => setAccount(null)}>Sign out</Button></> :
            <LoginForm authenticate={async ({ password }) => { if (password !== "demo-pass") throw new Error("Incorrect demo password."); }} onSuccess={setAccount} />}
        </div>
        <div className="border-t border-basalt-border px-basalt-space-lg py-basalt-space-lg">
          <p className="text-basalt-xs text-basalt-muted-foreground">Secure sign-in. Sessions stay with your application.</p>
        </div>
      </div>
    </main>
  </ThemeProvider>;
}
```

## ResourceList

Search, an error with retry, formatted status cells, and a confirmation flow use page-owned state. The first local deletion fails so the retry path can be tested. For remote pagination use the existing DataTable manual-state adapter.

```tsx compile:recipe-resources
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button } from "@nocoo/basalt/components/button";
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { DeleteResource } from "@nocoo/basalt/components/delete-resource";
import { Input } from "@nocoo/basalt/components/input";
import { ResourceList } from "@nocoo/basalt/components/resource-list";
import { ContentIsland } from "@nocoo/basalt/components/sidebar";
import { TagBadge } from "@nocoo/basalt/components/tag-badge";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { useRef, useState } from "react";

type Project = { id: string; name: string; status: "Active" | "Paused" };
const initial: Project[] = [
  { id: "atlas", name: "Atlas", status: "Active" }, { id: "boreal", name: "Boreal", status: "Paused" },
  { id: "cedar", name: "Cedar", status: "Active" },
];
export default function ResourcesRecipe() {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(true);
  const [message, setMessage] = useState("");
  const failDeletion = useRef(true);
  const filtered = rows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase()));
  const columns: DataTableColumn<Project>[] = [
    { id: "name", header: "Project", accessor: (row) => row.name },
    { id: "status", header: "Status", accessor: (row) => <TagBadge name={row.status} color={row.status === "Active" ? "success" : "warning"} /> },
    { id: "actions", header: "Actions", sortable: false, accessor: (row) => <DeleteResource name={row.name} onDelete={async () => {
      if (failDeletion.current) { failDeletion.current = false; throw new Error("Temporary conflict. Retry this deletion."); }
      setRows((current) => current.filter((item) => item.id !== row.id)); setMessage("Deleted " + row.name);
    }} /> },
  ];
  // A document page: the shell grows with content and the island owns the desktop inset.
  return <ThemeProvider><AppShell layout="document">
    <AppSkipLink href="#recipe-resources">Skip to content</AppSkipLink>
    <AppMain id="recipe-resources" tabIndex={-1}>
      <ContentIsland>
        <ResourceList title="Projects" description="A complete resource-page composition with local service adapters." data={[]}
          toolbar={<div className="flex flex-wrap gap-basalt-content-gap"><Input aria-label="Search projects" placeholder="Search projects…" value={query} onChange={(event) => setQuery(event.target.value)} /><Button variant="outline" onClick={() => { setRows(initial); setQuery(""); setMessage(""); }}>Reset projects</Button></div>}
          footer={<p role="status" className="text-basalt-sm text-basalt-muted-foreground">{message || (filtered.length + " projects")}</p>}>
          <DataTable aria-label="Projects" data={filtered} columns={columns} error={error ? "The project service is unavailable." : undefined} onRetry={() => setError(false)} />
        </ResourceList>
      </ContentIsland>
    </AppMain>
  </AppShell></ThemeProvider>;
}
```

## Mobile layouts

Use `responsive` for mobile root scrolling and desktop island scrolling; `document` keeps root scrolling at every width, while `workspace` remains bounded everywhere. Select this per layout, not by user-agent. Place the compact sticky header inside the edge-to-edge island for a single immersive row. Keep a normal PageHeader in a desktop-only wrapper when it adds context. The outer wrapper must not retain mobile `px-2 pb-2`; the island cannot remove its parent's spacing.

This complete recipe compiles from the installed package. Supply content and actions from the application; there are no routing, article, account or network assumptions. The consumer owns a zero-margin body and viewport metadata (`width=device-width, initial-scale=1, viewport-fit=cover`). Do not lock body scrolling or add height/overflow constraints to intermediate wrappers. The shell handles safe areas; the sticky header paints the notch gap without charging the initial top inset twice. Bottom safe area follows the last content, not a fixed footer strip.

```tsx compile:recipe-mobile-layout
import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button } from "@nocoo/basalt/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nocoo/basalt/components/popover";
import { ContentIsland } from "@nocoo/basalt/components/sidebar";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";

export default function MobileLayoutRecipe() {
  return <ThemeProvider><AppShell layout="responsive">
    <AppSkipLink>Skip to content</AppSkipLink>
    <AppMain>
      <ContentIsland mobileSurface="edge-to-edge">
        <AppHeader sticky density="compact" title="Field notes" actions={
          <Popover><PopoverTrigger asChild><Button variant="ghost">Options</Button></PopoverTrigger>
            <PopoverContent aria-label="Options"><p>Application-owned reading preferences.</p></PopoverContent>
          </Popover>
        } />
        <article className="mx-auto max-w-[65ch] space-y-basalt-space-lg p-basalt-layout text-basalt-base leading-basalt-relaxed">
          {Array.from({ length: 24 }, (_, index) => <section key={index}>
            <h2>Observation {index + 1}</h2>
            <p>The shell leaves the document in charge on a narrow screen. Content grows naturally, the header stays reachable, and the final paragraph remains above the trailing safe area.</p>
          </section>)}
          <p>End of notes.</p>
        </article>
      </ContentIsland>
    </AppMain>
  </AppShell></ThemeProvider>;
}
```

### List/detail and form boundaries

- Full-page examples: [reader](https://basaltui.com/examples/reader), [list/detail](https://basaltui.com/examples/list-detail), [workspace/form](https://basaltui.com/examples/workspace). Open them outside another AppShell; do not nest viewport shells.
- Use `ResponsiveMasterDetail` inside a `ContentIsland` with `className="md:overflow-hidden"`, and give the composition `className="md:h-full"`. Its desktop panes scroll independently; below 768px only the visible pane participates in document layout. The application owns selection. Built-in back navigation restores focus to the opening item, with a region fallback if it no longer exists.
- Keep `mobileSurface="inset"` for regular forms. Use native labels, appropriate input types and at least 44px controls; 16px input text avoids the common small-text zoom problem without disabling user zoom. Browser scrolling brings focused fields into view; never reposition the viewport with innerHeight.
- Modal `Sheet`/overlay `Sidebar` owns focus trapping, Escape, focus restoration and background scroll locking. Do not add a second manual body lock. An expanded Sidebar inside a Sheet stays bounded and owns the portal's safe-area padding once.
- Automated Chromium/WebKit evidence covers geometry, document/pane scroll owners, resize, focus and overlays. Real iPhone Safari toolbar collapse, notch behavior during toolbar transitions, and software keyboard reachability require a physical-device check; desktop WebKit is not that proof.
