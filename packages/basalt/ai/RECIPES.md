# Application recipes

These complete modules, included in v2.1.0, use only public Basalt imports and React.

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
import { Sidebar, SidebarHeader, SidebarItem, SidebarNav, SidebarProvider } from "@nocoo/basalt/components/sidebar";
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
  return <ThemeProvider><div style={{ position: "fixed", inset: 0 }}>
    <SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed} overlay={compact}>
      <AppShell>
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
          <div style={{ overflow: "auto", flex: 1, padding: 24 }}>
            <PageHeader title={page} description="A reusable application frame with responsive navigation." />
            <p role="status" className="mt-4 text-sm text-basalt-muted-foreground">Opened {page}. Your application supplies routes and page content.</p>
          </div>
        </AppMain>
      </AppShell>
    </SidebarProvider>
  </div></ThemeProvider>;
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
  return <form aria-label="Sign in" className="space-y-4" onSubmit={async (event) => {
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
    {error && <p role="alert" className="text-sm text-basalt-destructive">{error}</p>}
    <Button className="w-full" type="submit" loading={pending}>Sign in</Button>
  </form>;
}

export default function LoginRecipe() {
  const [account, setAccount] = useState<string | null>(null);
  return <ThemeProvider><main style={{ boxSizing: "border-box", minHeight: "100dvh", display: "grid", placeItems: "center", padding: 16 }}>
    <div className="rounded-basalt-lg border border-basalt-border bg-basalt-card p-6 space-y-4" style={{ boxSizing: "border-box", width: "100%", maxWidth: 380 }}>
      <h1 className="text-xl font-semibold">Welcome to Atlas</h1>
      {account ? <><p role="status">Signed in as {account}</p><Button onClick={() => setAccount(null)}>Sign out</Button></> :
        <><p className="text-sm text-basalt-muted-foreground">Local sign-in demo. Use password demo-pass.</p>
        <LoginForm authenticate={async ({ password }) => { if (password !== "demo-pass") throw new Error("Incorrect demo password."); }} onSuccess={setAccount} /></>}
    </div>
  </main></ThemeProvider>;
}
```

## ResourceList

Search, an error with retry, formatted status cells, and a confirmation flow use page-owned state. The first local deletion fails so the retry path can be tested. For remote pagination use the existing DataTable manual-state adapter.

```tsx compile:recipe-resources
import { Button } from "@nocoo/basalt/components/button";
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { DeleteResource } from "@nocoo/basalt/components/delete-resource";
import { Input } from "@nocoo/basalt/components/input";
import { ResourceList } from "@nocoo/basalt/components/resource-list";
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
  return <ThemeProvider><main style={{ padding: 24, maxWidth: 960, margin: "auto" }}>
    <ResourceList title="Projects" description="A complete resource-page composition with local service adapters." data={[]}
      toolbar={<div className="flex flex-wrap gap-3"><Input aria-label="Search projects" placeholder="Search projects…" value={query} onChange={(event) => setQuery(event.target.value)} /><Button variant="outline" onClick={() => { setRows(initial); setQuery(""); setMessage(""); }}>Reset projects</Button></div>}
      footer={<p role="status" className="text-sm text-basalt-muted-foreground">{message || (filtered.length + " projects")}</p>}>
      <DataTable aria-label="Projects" data={filtered} columns={columns} error={error ? "The project service is unavailable." : undefined} onRetry={() => setError(false)} />
    </ResourceList>
  </main></ThemeProvider>;
}
```
