import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";
import { CodeBlock, CodeHighlighted } from "@nocoo/basalt/components/code";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { Empty } from "@nocoo/basalt/components/empty";
import { Flow, FlowNode } from "@nocoo/basalt/components/flow";
import { Grid, GridItem } from "@nocoo/basalt/components/grid";
import { Link } from "@nocoo/basalt/components/link";
import { Loader } from "@nocoo/basalt/components/loader";
import { Meter } from "@nocoo/basalt/components/meter";
import { Pagination } from "@nocoo/basalt/components/pagination";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { Text } from "@nocoo/basalt/components/text";
import { toast } from "@nocoo/basalt/components/toast";
import { Toolbar } from "@nocoo/basalt/components/toolbar";
import { AlertTriangle, Check, CircleAlert, Inbox, Info, Plus, Search } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type CatalogScenario, catalogScenarioId } from "./catalog-scenario";

function Preview({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={className ?? "flex flex-wrap items-center gap-3"}>{children}</div>;
}

function PaginationExample({
	page: initialPage = 1,
	pageCount = 10,
	simple = false,
}: {
	page?: number;
	pageCount?: number;
	simple?: boolean;
}) {
	const [page, setPage] = useState(initialPage);
	return <Pagination page={page} pageCount={pageCount} onPageChange={setPage} simple={simple} />;
}

function CommandPaletteExample({ flat = false }: { flat?: boolean }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				Search pages...
			</Button>
			<CommandPalette open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search pages..." />
				<CommandList>
					<CommandEmpty>No results</CommandEmpty>
					{flat ? (
						<>
							<CommandItem>Button</CommandItem>
							<CommandItem>Input</CommandItem>
						</>
					) : (
						<CommandGroup heading="Pages">
							<CommandItem>Button</CommandItem>
							<CommandItem>Input</CommandItem>
						</CommandGroup>
					)}
				</CommandList>
			</CommandPalette>
		</>
	);
}

export const KUMO_EXAMPLES: Record<string, CatalogScenario[]> = {
	badge: [
		{
			id: catalogScenarioId("badge", "primary-badges"),
			title: "Primary Badges",
			code: "<Badge>Default</Badge>",
			render: () => <Badge>Default</Badge>,
		},
		{
			id: catalogScenarioId("badge", "other-color-variants"),
			title: "Other color variants",
			code: `<Badge variant="secondary">Secondary</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`,
			render: () => (
				<Preview>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="info">Info</Badge>
					<Badge variant="success">Success</Badge>
					<Badge variant="warning">Warning</Badge>
					<Badge variant="error">Error</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("badge", "color-tokens"),
			title: "Color tokens",
			code: `<Badge variant="red">Red</Badge>
<Badge variant="orange">Orange</Badge>
<Badge variant="teal">Teal</Badge>
<Badge variant="blue">Blue</Badge>
<Badge variant="purple">Purple</Badge>`,
			render: () => (
				<Preview>
					<Badge variant="red">Red</Badge>
					<Badge variant="orange">Orange</Badge>
					<Badge variant="teal">Teal</Badge>
					<Badge variant="blue">Blue</Badge>
					<Badge variant="purple">Purple</Badge>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("badge", "dot-badges"),
			title: "Dot badges",
			code: `<Badge dot>Live</Badge>
<Badge dot variant="success">Healthy</Badge>`,
			render: () => (
				<Preview>
					<Badge dot>Live</Badge>
					<Badge dot variant="success">
						Healthy
					</Badge>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("badge", "in-a-sentence"),
			title: "In a sentence",
			code: "<Text>Status is <Badge>Stable</Badge></Text>",
			render: () => (
				<Text>
					Status is <Badge>Stable</Badge>
				</Text>
			),
		},
		{
			id: catalogScenarioId("badge", "with-an-icon"),
			title: "With an icon",
			code: `<Badge><Check className="size-3" /> Verified</Badge>
<Badge variant="success"><Check className="size-3" /> Healthy</Badge>
<Badge variant="warning"><AlertTriangle className="size-3" /> Warning</Badge>
<Badge variant="error"><CircleAlert className="size-3" /> Error</Badge>
<Badge variant="info"><Info className="size-3" /> Info</Badge>`,
			render: () => (
				<Preview>
					<Badge>
						<Check className="size-3" /> Verified
					</Badge>
					<Badge variant="success">
						<Check className="size-3" /> Healthy
					</Badge>
					<Badge variant="warning">
						<AlertTriangle className="size-3" /> Warning
					</Badge>
					<Badge variant="error">
						<CircleAlert className="size-3" /> Error
					</Badge>
					<Badge variant="info">
						<Info className="size-3" /> Info
					</Badge>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("badge", "linked-badge"),
			title: "Linked badge",
			code: '<Link href="#"><Badge>Docs</Badge></Link>',
			render: () => (
				<Link href="#">
					<Badge>Docs</Badge>
				</Link>
			),
		},
	],
	breadcrumbs: [
		{
			id: catalogScenarioId("breadcrumbs", "basic"),
			title: "Basic",
			code: '<Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />',
			render: () => <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />,
		},
		{
			id: catalogScenarioId("breadcrumbs", "loading"),
			title: "Loading",
			code: "<Breadcrumbs items={[{ label: <SkeletonLine minWidth={72} /> }]} />",
			render: () => <Breadcrumbs items={[{ label: <SkeletonLine minWidth={72} /> }]} />,
		},
	],
	"clipboard-text": [
		{
			id: catalogScenarioId("clipboard-text", "short-text"),
			title: "Short Text",
			code: '<ClipboardText text="bun add @nocoo/basalt" />',
			render: () => <ClipboardText text="bun add @nocoo/basalt" />,
		},
		{
			id: catalogScenarioId("clipboard-text", "api-key"),
			title: "API Key",
			code: '<ClipboardText text="project-••••" copyText="project-atlas" />',
			render: () => <ClipboardText text="project-••••" copyText="project-atlas" />,
		},
		{
			id: catalogScenarioId("clipboard-text", "copy-alternate-text"),
			title: "Copy Alternate Text",
			code: '<ClipboardText text="Visible label" copyText="copied-value" />',
			render: () => <ClipboardText text="Visible label" copyText="copied-value" />,
		},
		{
			id: catalogScenarioId("clipboard-text", "long-text"),
			title: "Long Text",
			code: '<ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />',
			render: () => <ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />,
		},
	],
	empty: [
		{
			id: catalogScenarioId("empty", "basic"),
			title: "Basic",
			code: '<Empty title="No results" description="Try another query." />',
			render: () => <Empty title="No results" description="Try another query." />,
		},
		{
			id: catalogScenarioId("empty", "with-icon"),
			title: "With icon",
			code: '<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />',
			render: () => (
				<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />
			),
		},
	],
	loader: [
		{
			id: catalogScenarioId("loader", "default-size"),
			title: "Default Size",
			code: "<Loader />",
			render: () => <Loader />,
		},
		{
			id: catalogScenarioId("loader", "custom-size"),
			title: "Custom Size",
			code: "<Loader size={16} /><Loader size={24} /><Loader size={32} />",
			render: () => (
				<Preview>
					<Loader size={16} />
					<Loader size={24} />
					<Loader size={32} />
				</Preview>
			),
		},
	],
	meter: [
		{
			id: catalogScenarioId("meter", "basic-meter"),
			title: "Basic Meter",
			code: '<Meter value={40} label="Usage" />',
			render: () => <Meter value={40} label="Usage" />,
		},
		{
			id: catalogScenarioId("meter", "custom-value-display"),
			title: "Custom Value Display",
			code: '<Meter value={12} label="Storage" customValue="12 GB" />',
			render: () => <Meter value={12} label="Storage" customValue="12 GB" />,
		},
		{
			id: catalogScenarioId("meter", "hidden-value"),
			title: "Hidden Value",
			code: '<Meter value={72} label="Progress" hideValue />',
			render: () => <Meter value={72} label="Progress" hideValue />,
		},
		{
			id: catalogScenarioId("meter", "full-meter"),
			title: "Full Meter",
			code: '<Meter value={100} label="Complete" />',
			render: () => <Meter value={100} label="Complete" />,
		},
		{
			id: catalogScenarioId("meter", "low-value"),
			title: "Low Value",
			code: '<Meter value={8} label="Quota" />',
			render: () => <Meter value={8} label="Quota" />,
		},
	],
	pagination: [
		{
			id: catalogScenarioId("pagination", "full-controls-default"),
			title: "Full Controls (Default)",
			code: "const [page, setPage] = useState(1);\nreturn <Pagination page={page} pageCount={10} onPageChange={setPage} />;",
			render: () => <PaginationExample page={1} pageCount={10} />,
		},
		{
			id: catalogScenarioId("pagination", "simple-controls"),
			title: "Simple Controls",
			code: "const [page, setPage] = useState(2);\nreturn <Pagination page={page} pageCount={10} simple onPageChange={setPage} />;",
			render: () => <PaginationExample page={2} pageCount={10} simple />,
		},
		{
			id: catalogScenarioId("pagination", "mid-page-state"),
			title: "Mid-Page State",
			code: "const [page, setPage] = useState(5);\nreturn <Pagination page={page} pageCount={12} onPageChange={setPage} />;",
			render: () => <PaginationExample page={5} pageCount={12} />,
		},
	],
	"skeleton-line": [
		{
			id: catalogScenarioId("skeleton-line", "default"),
			title: "Default",
			code: `<SkeletonLine minWidth={40} maxWidth={55} />
<SkeletonLine minWidth={75} maxWidth={90} />
<SkeletonLine minWidth={90} maxWidth={100} />`,
			render: () => (
				<div className="flex w-64 flex-col gap-3">
					<SkeletonLine minWidth={40} maxWidth={55} />
					<SkeletonLine minWidth={75} maxWidth={90} />
					<SkeletonLine minWidth={90} maxWidth={100} />
				</div>
			),
		},
		{
			id: catalogScenarioId("skeleton-line", "width"),
			title: "Width",
			code: `<SkeletonLine minWidth={80} maxWidth={100} />
<SkeletonLine minWidth={60} maxWidth={80} />
<SkeletonLine minWidth={40} maxWidth={60} />`,
			render: () => (
				<div className="flex w-64 flex-col gap-3">
					<SkeletonLine minWidth={80} maxWidth={100} />
					<SkeletonLine minWidth={60} maxWidth={80} />
					<SkeletonLine minWidth={40} maxWidth={60} />
				</div>
			),
		},
		{
			id: catalogScenarioId("skeleton-line", "height"),
			title: "Height",
			code: `<SkeletonLine className="h-2" minWidth={90} maxWidth={100} />
<SkeletonLine className="h-4" minWidth={90} maxWidth={100} />
<SkeletonLine className="h-6" minWidth={90} maxWidth={100} />
<SkeletonLine className="h-8" minWidth={90} maxWidth={100} />`,
			render: () => (
				<div className="flex w-64 flex-col gap-3">
					<SkeletonLine className="h-2" minWidth={90} maxWidth={100} />
					<SkeletonLine className="h-4" minWidth={90} maxWidth={100} />
					<SkeletonLine className="h-6" minWidth={90} maxWidth={100} />
					<SkeletonLine className="h-8" minWidth={90} maxWidth={100} />
				</div>
			),
		},
	],
	tabs: [
		{
			id: catalogScenarioId("tabs", "variants"),
			title: "Variants",
			code: `<Tabs defaultValue="a">
  <TabsList>
    <TabsTrigger value="a">Home</TabsTrigger>
    <TabsTrigger value="b">About</TabsTrigger>
  </TabsList>
  <TabsContent value="a">Home overview and getting started.</TabsContent>
  <TabsContent value="b">About this project and its goals.</TabsContent>
</Tabs>`,
			render: () => (
				<Tabs defaultValue="a">
					<TabsList>
						<TabsTrigger value="a">Home</TabsTrigger>
						<TabsTrigger value="b">About</TabsTrigger>
					</TabsList>
					<TabsContent value="a">Home overview and getting started.</TabsContent>
					<TabsContent value="b">About this project and its goals.</TabsContent>
				</Tabs>
			),
		},
		{
			id: catalogScenarioId("tabs", "many-tabs"),
			title: "Many Tabs",
			code: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="usage">Usage</TabsTrigger>
    <TabsTrigger value="api">API</TabsTrigger>
    <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
    <TabsTrigger value="changelog">Changelog</TabsTrigger>
  </TabsList>
</Tabs>`,
			render: () => (
				<Tabs defaultValue="overview">
					<TabsList>
						{["Overview", "Usage", "API", "Accessibility", "Changelog"].map((label) => (
							<TabsTrigger key={label} value={label.toLowerCase()}>
								{label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			),
		},
	],
	toast: [
		{
			id: catalogScenarioId("toast", "title-only"),
			title: "Title Only",
			code: '<Button onClick={() => toast("Saved")}>Title only</Button>',
			render: () => <Button onClick={() => toast("Saved")}>Title only</Button>,
		},
		{
			id: catalogScenarioId("toast", "title-and-description"),
			title: "Title and Description",
			code: '<Button onClick={() => toast("Saved", { description: "Project updated." })}>With description</Button>',
			render: () => (
				<Button onClick={() => toast("Saved", { description: "Project updated." })}>
					With description
				</Button>
			),
		},
		{
			id: catalogScenarioId("toast", "success-variant"),
			title: "Success Variant",
			code: '<Button onClick={() => toast.success("Deployed")}>Success</Button>',
			render: () => <Button onClick={() => toast.success("Deployed")}>Success</Button>,
		},
		{
			id: catalogScenarioId("toast", "error-variant"),
			title: "Error Variant",
			code: '<Button onClick={() => toast.error("Failed")}>Error</Button>',
			render: () => <Button onClick={() => toast.error("Failed")}>Error</Button>,
		},
		{
			id: catalogScenarioId("toast", "warning-variant"),
			title: "Warning Variant",
			code: '<Button onClick={() => toast.warning("Expiring")}>Warning</Button>',
			render: () => <Button onClick={() => toast.warning("Expiring")}>Warning</Button>,
		},
		{
			id: catalogScenarioId("toast", "info-variant"),
			title: "Info Variant",
			code: '<Button onClick={() => toast.info("Queued")}>Info</Button>',
			render: () => <Button onClick={() => toast.info("Queued")}>Info</Button>,
		},
		{
			id: catalogScenarioId("toast", "close-button"),
			title: "Close button",
			code: '<Button onClick={() => toast("Saved", { close: true, description: "Dismiss with X." })}>With close</Button>',
			render: () => (
				<Button onClick={() => toast("Saved", { close: true, description: "Dismiss with X." })}>
					With close
				</Button>
			),
		},
		{
			id: catalogScenarioId("toast", "hidden-close"),
			title: "Hidden close",
			code: '<Button onClick={() => toast("Saved", { close: false, description: "No X control." })}>No close</Button>',
			render: () => (
				<Button onClick={() => toast("Saved", { close: false, description: "No X control." })}>
					No close
				</Button>
			),
		},
		{
			id: catalogScenarioId("toast", "custom-icon"),
			title: "Custom icon",
			code: '<Button onClick={() => toast.success("Verified", { icon: <Check className="size-4" />, description: "Custom icon passed as a parameter." })}>Custom icon</Button>',
			render: () => (
				<Button
					onClick={() =>
						toast.success("Verified", {
							icon: <Check className="size-4" />,
							description: "Custom icon passed as a parameter.",
						})
					}
				>
					Custom icon
				</Button>
			),
		},
		{
			id: catalogScenarioId("toast", "hidden-icon"),
			title: "Hidden icon",
			code: '<Button onClick={() => toast.success("Deployed", { icon: false })}>No icon</Button>',
			render: () => (
				<Button onClick={() => toast.success("Deployed", { icon: false })}>No icon</Button>
			),
		},
	],
	table: [
		{
			id: catalogScenarioId("table", "basic"),
			title: "Basic",
			code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Report 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Report 2</TableCell>
      <TableCell>Paused</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Report 3</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
			render: () => (
				<Table className="w-[200px]">
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Report 1</TableCell>
							<TableCell>Active</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Report 2</TableCell>
							<TableCell>Paused</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Report 3</TableCell>
							<TableCell>Active</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			),
		},
		{
			id: catalogScenarioId("table", "selected-row"),
			title: "Selected Row",
			code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow variant="selected">
      <TableCell>Selected</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Idle</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
			render: () => (
				<Table className="w-[200px]">
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow variant="selected">
							<TableCell>Selected</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Idle</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			),
		},
	],
	"table-of-contents": [
		{
			id: catalogScenarioId("table-of-contents", "options"),
			title: "Options",
			code: `<TableOfContents>
  <TableOfContentsItem active>Intro</TableOfContentsItem>
  <TableOfContentsItem>Usage</TableOfContentsItem>
</TableOfContents>`,
			render: () => (
				<TableOfContents>
					<TableOfContentsItem active>Intro</TableOfContentsItem>
					<TableOfContentsItem>Usage</TableOfContentsItem>
				</TableOfContents>
			),
		},
		{
			id: catalogScenarioId("table-of-contents", "no-active-item"),
			title: "No active item",
			code: `<TableOfContents>
  <TableOfContentsItem>Intro</TableOfContentsItem>
  <TableOfContentsItem>Usage</TableOfContentsItem>
</TableOfContents>`,
			render: () => (
				<TableOfContents>
					<TableOfContentsItem>Intro</TableOfContentsItem>
					<TableOfContentsItem>Usage</TableOfContentsItem>
				</TableOfContents>
			),
		},
		{
			id: catalogScenarioId("table-of-contents", "without-title"),
			title: "Without title",
			code: `<TableOfContents title="">
  <TableOfContentsItem active>Intro</TableOfContentsItem>
</TableOfContents>`,
			render: () => (
				<TableOfContents title="">
					<TableOfContentsItem active>Intro</TableOfContentsItem>
				</TableOfContents>
			),
		},
	],
	toolbar: [
		{
			id: catalogScenarioId("toolbar", "input-shorthand"),
			title: "Input Shorthand",
			code: '<Toolbar><Toolbar.Input aria-label="Search records" placeholder="Search..." /><Toolbar.Button icon={<Search />} aria-label="Search" /><Toolbar.Button icon={<Plus />} aria-label="Add" /></Toolbar>',
			render: () => (
				<Toolbar className="w-full max-w-md">
					<Toolbar.Input aria-label="Search records" placeholder="Search..." className="flex-1" />
					<Toolbar.Button icon={<Search />} aria-label="Search" />
					<Toolbar.Button icon={<Plus />} aria-label="Add" />
				</Toolbar>
			),
		},
		{
			id: catalogScenarioId("toolbar", "button-actions"),
			title: "Button Actions",
			code: "<Toolbar><Toolbar.Button>Upload</Toolbar.Button><Toolbar.Button>Download</Toolbar.Button></Toolbar>",
			render: () => (
				<Toolbar>
					<Toolbar.Button>Upload</Toolbar.Button>
					<Toolbar.Button>Download</Toolbar.Button>
				</Toolbar>
			),
		},
	],
	grid: [
		{
			id: catalogScenarioId("grid", "grid"),
			title: "Grid",
			code: `<Grid className="w-full max-w-sm">
  <GridItem>1</GridItem>
  <GridItem>2</GridItem>
  <GridItem>3</GridItem>
  <GridItem>4</GridItem>
</Grid>`,
			render: () => (
				<Grid className="w-full max-w-sm">
					<GridItem>1</GridItem>
					<GridItem>2</GridItem>
					<GridItem>3</GridItem>
					<GridItem>4</GridItem>
				</Grid>
			),
		},
	],
	flow: [
		{
			id: catalogScenarioId("flow", "sequential-flow"),
			title: "Sequential Flow",
			code: "<Flow><FlowNode>Step 1</FlowNode><FlowNode>Step 2</FlowNode></Flow>",
			render: () => (
				<Flow>
					<FlowNode>Step 1</FlowNode>
					<FlowNode>Step 2</FlowNode>
				</Flow>
			),
		},
	],
	code: [
		{
			id: catalogScenarioId("code", "typescript"),
			title: "TypeScript",
			code: `<CodeHighlighted code={\`export async function fetchUser(id: string, retries = 3) {
  const response = await fetch("/api/users/" + id);
  if (!response.ok) {
    throw new Error("User not found");
  }
  const user = await response.json();
  return {
    id: user.id,
    name: user.firstName + " " + user.lastName,
  };
}\`} />`,
			render: () => (
				<CodeHighlighted
					code={`export async function fetchUser(id: string, retries = 3) {
  // Resolve a profile, then return a display name.
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error("User not found");
  }
  const user = await response.json();
  return {
    id: user.id,
    name: \`\${user.firstName} \${user.lastName}\`,
  };
}`}
				/>
			),
		},
		{
			id: catalogScenarioId("code", "react"),
			title: "React",
			code: `<CodeHighlighted code={\`import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((n) => n + 1)}>
      Count: {count}
    </button>
  );
}\`} />`,
			render: () => (
				<CodeHighlighted
					code={`import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((n) => n + 1)}>
      Count: {count}
    </button>
  );
}`}
				/>
			),
		},
	],
	"code-block": [
		{
			id: catalogScenarioId("code-block", "basic"),
			title: "Basic",
			code: "<CodeBlock>const n = 1</CodeBlock>",
			render: () => <CodeBlock>const n = 1</CodeBlock>,
		},
	],
	avatar: [
		{
			id: catalogScenarioId("avatar", "fallback"),
			title: "Fallback",
			code: "<Avatar><AvatarFallback>ZL</AvatarFallback></Avatar>",
			render: () => (
				<Avatar>
					<AvatarFallback>ZL</AvatarFallback>
				</Avatar>
			),
		},
	],
	"command-palette": [
		{
			id: catalogScenarioId("command-palette", "with-grouped-items"),
			title: "With Grouped Items",
			code: `import { Button } from "@nocoo/basalt/components/button";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Search pages...</Button>
      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem>Button</CommandItem>
            <CommandItem>Input</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandPalette>
    </>
  );
}`,
			render: () => <CommandPaletteExample />,
		},
		{
			id: catalogScenarioId("command-palette", "simple-flat-list"),
			title: "Simple Flat List",
			code: `import { Button } from "@nocoo/basalt/components/button";
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Search pages...</Button>
      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandItem>Button</CommandItem>
          <CommandItem>Input</CommandItem>
        </CommandList>
      </CommandPalette>
    </>
  );
}`,
			render: () => <CommandPaletteExample flat />,
		},
	],
};
