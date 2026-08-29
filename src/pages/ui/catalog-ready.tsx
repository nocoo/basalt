import { AreaChart } from "@nocoo/basalt/charts/area";
import { BarChart } from "@nocoo/basalt/charts/bar";
import { BulletChart } from "@nocoo/basalt/charts/bullet";
import { Colors } from "@nocoo/basalt/charts/chart-colors";
import { Charts } from "@nocoo/basalt/charts/charts";
import { CustomChart } from "@nocoo/basalt/charts/custom-chart";
import { DateNavigation } from "@nocoo/basalt/charts/date-navigation";
import { DonutChart } from "@nocoo/basalt/charts/donut";
import { FunnelChart } from "@nocoo/basalt/charts/funnel";
import { Gauge } from "@nocoo/basalt/charts/gauge";
import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
import { HeatmapCalendar } from "@nocoo/basalt/charts/heatmap-calendar";
import { ItemList } from "@nocoo/basalt/charts/item-list";
import { LineChart } from "@nocoo/basalt/charts/line";
import { ChartPalette } from "@nocoo/basalt/charts/palette";
import { RadarChart } from "@nocoo/basalt/charts/radar";
import { SankeyChart } from "@nocoo/basalt/charts/sankey";
import { SlotBarChart } from "@nocoo/basalt/charts/slot-bar";
import { Sparkline } from "@nocoo/basalt/charts/sparkline";
import { StackedBarChart } from "@nocoo/basalt/charts/stacked-bar";
import { StatCard } from "@nocoo/basalt/charts/stat-card";
import { Timeline } from "@nocoo/basalt/charts/timeline";
import { Timeseries } from "@nocoo/basalt/charts/timeseries";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@nocoo/basalt/components/accordion";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@nocoo/basalt/components/alert-dialog";
import { Autocomplete } from "@nocoo/basalt/components/autocomplete";
import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { BasaltMark } from "@nocoo/basalt/components/basalt-mark";
import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";
import { Code, CodeBlock } from "@nocoo/basalt/components/code";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import { Combobox } from "@nocoo/basalt/components/combobox";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuPanel,
	ContextMenuTrigger,
} from "@nocoo/basalt/components/context-menu";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";
import { Empty } from "@nocoo/basalt/components/empty";
import { Flow, FlowNode } from "@nocoo/basalt/components/flow";
import { Grid, GridItem } from "@nocoo/basalt/components/grid";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@nocoo/basalt/components/hover-card";
import { Loader } from "@nocoo/basalt/components/loader";
import { MenuBarMenu, MenuBarRoot, MenuBarTrigger } from "@nocoo/basalt/components/menu-bar";
import { Meter } from "@nocoo/basalt/components/meter";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@nocoo/basalt/components/navigation-menu";
import { Pagination } from "@nocoo/basalt/components/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@nocoo/basalt/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@nocoo/basalt/components/sheet";
import { ContentIsland, Sidebar } from "@nocoo/basalt/components/sidebar";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { Slider } from "@nocoo/basalt/components/slider";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";
import { Tabs, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { toast } from "@nocoo/basalt/components/toast";
import { Toggle } from "@nocoo/basalt/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@nocoo/basalt/components/toggle-group";
import { Toolbar } from "@nocoo/basalt/components/toolbar";
import { AlertTriangle, CircleAlert, Info, Plus, Search, X } from "lucide-react";
import { type ComponentType, useState } from "react";
import { CATALOG, type CatalogEntry, catalogImportPath } from "./catalog";

type CatalogDocs = {
	description: string;
	usage: string;
	variants: string[];
	props: { name: string; type: string; default?: string; description?: string }[];
	source: { repo: string; sha: string; file: string };
};

const SRC = { repo: "pew", sha: "97a890fabe6e", file: "packages/web/src/components" };

function page(
	entry: CatalogEntry,
	description: string,
	Demo: ComponentType,
	sample: string,
	props: CatalogDocs["props"] = [{ name: "className", type: "string" }],
	usage?: string,
): { demo: ComponentType; docs: CatalogDocs } {
	return {
		demo: Demo,
		docs: {
			description,
			usage:
				usage ??
				`import { ${entry.name.replace(/ /g, "")} } from "${catalogImportPath(entry)}";\n\nexport default function Example() {\n\treturn ${sample};\n}`,
			variants: [],
			props: props.map((prop) => ({
				...prop,
				description: prop.description ?? prop.name,
			})),
			source: SRC,
		},
	};
}

const extra: Record<string, { demo: ComponentType; docs: CatalogDocs }> = {};

function add(
	slug: string,
	description: string,
	Demo: ComponentType,
	sample: string,
	props?: CatalogDocs["props"],
	usage?: string,
) {
	const entry = CATALOG.find((item) => item.slug === slug);
	if (!entry) {
		return;
	}
	extra[slug] = page(entry, description, Demo, sample, props, usage);
}

add("badge", "Compact status labels.", () => <Badge>Stable</Badge>, "<Badge>Stable</Badge>");
function BannerVariantsDemo() {
	return (
		<div className="w-full space-y-3">
			<Banner
				icon={<Info />}
				title="Update available"
				description="A new version is ready to install."
			/>
			<Banner
				icon={<AlertTriangle />}
				variant="alert"
				title="Session expiring"
				description="Your session will expire in 5 minutes."
			/>
			<Banner
				icon={<CircleAlert />}
				variant="error"
				title="Save failed"
				description="We couldn't save your changes. Please try again."
			/>
			<Banner
				icon={<Info />}
				variant="secondary"
				title="Maintenance scheduled"
				description="This service will be unavailable for 10 minutes."
			/>
		</div>
	);
}
add(
	"banner",
	"Displays contextual inline messages for informational, alert, or error states.",
	() => <BannerVariantsDemo />,
	'<Banner icon={<Info />} title="Update available" description="A new version is ready to install." />',
	[
		{
			name: "variant",
			type: '"default" | "alert" | "error" | "secondary"',
			default: '"default"',
			description: "Visual style of the banner.",
		},
		{
			name: "size",
			type: '"base" | "sm"',
			default: '"base"',
			description: "Compact size for dialogs and tight spaces.",
		},
		{ name: "icon", type: "ReactNode", description: "Icon rendered before the banner content." },
		{ name: "title", type: "string", description: "Primary heading text." },
		{
			name: "description",
			type: "ReactNode",
			description: "Secondary copy below the title.",
		},
		{
			name: "action",
			type: "ReactNode",
			description: "Trailing CTA slot. Use Banner.Action for accent-aware buttons.",
		},
		{ name: "className", type: "string" },
	],
	`import { Banner } from "@nocoo/basalt/components/banner";
import { Info } from "lucide-react";

export default function Example() {
	return (
		<Banner
			icon={<Info />}
			title="Update available"
			description="A new version is ready to install."
		/>
	);
}`,
);
add("loader", "Indicates a pending state.", () => <Loader />, "<Loader />");
add(
	"skeleton-line",
	"Placeholder lines while content loads.",
	() => (
		<div className="flex w-64 flex-col gap-3">
			<SkeletonLine minWidth={40} maxWidth={55} />
			<SkeletonLine minWidth={75} maxWidth={90} />
			<SkeletonLine minWidth={90} maxWidth={100} />
		</div>
	),
	"<SkeletonLine minWidth={40} maxWidth={55} />",
);
add(
	"empty",
	"Empty-state copy.",
	() => <Empty title="No results" description="Try another query." />,
	"<Empty />",
);
add("basalt-mark", "Basalt mark.", () => <BasaltMark />, "<BasaltMark />");
add("code", "Inline code highlighting.", () => <Code>cn()</Code>, "<Code>cn()</Code>");
add(
	"code-block",
	"A fenced code block.",
	() => <CodeBlock>const n = 1;</CodeBlock>,
	"<CodeBlock>code</CodeBlock>",
);
add(
	"clipboard-text",
	"Copyable text.",
	() => <ClipboardText text="bun add @nocoo/basalt" />,
	"<ClipboardText text='…' />",
);
add("meter", "Numeric meter.", () => <Meter value={60} label="Usage" />, "<Meter value={60} />");
add(
	"avatar",
	"User avatar.",
	() => (
		<Avatar>
			<AvatarFallback>ZL</AvatarFallback>
		</Avatar>
	),
	"<Avatar />",
);
add(
	"accordion",
	"Expandable sections.",
	() => (
		<Accordion type="single" collapsible>
			<AccordionItem value="a">
				<AccordionTrigger>Item</AccordionTrigger>
				<AccordionContent>Body</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
	"<Accordion />",
);
add(
	"collapsible",
	"A composable disclosure for showing and hiding content.",
	() => (
		<Collapsible>
			<CollapsibleTrigger>What is Kumo?</CollapsibleTrigger>
			<CollapsibleContent>Kumo is Cloudflare's component library.</CollapsibleContent>
		</Collapsible>
	),
	"<Collapsible><CollapsibleTrigger>What is Kumo?</CollapsibleTrigger><CollapsibleContent>…</CollapsibleContent></Collapsible>",
);
add(
	"tabs",
	"Tabbed navigation.",
	() => (
		<Tabs defaultValue="a">
			<TabsList>
				<TabsTrigger value="a">Home</TabsTrigger>
				<TabsTrigger value="b">About</TabsTrigger>
			</TabsList>
		</Tabs>
	),
	"<Tabs />",
);
add(
	"slider",
	"Range slider.",
	() => <Slider defaultValue={[40]} aria-label="Volume" />,
	"<Slider />",
);
add("toggle", "Pressed toggle.", () => <Toggle aria-label="Bold">B</Toggle>, "<Toggle>B</Toggle>");
add(
	"toggle-group",
	"Segmented tabs for switching a compact set of modes.",
	() => (
		<ToggleGroup type="single" defaultValue="live" aria-label="Mode">
			<ToggleGroupItem value="live">Live</ToggleGroupItem>
			<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			<ToggleGroupItem value="snapshot">Snapshot</ToggleGroupItem>
		</ToggleGroup>
	),
	'<ToggleGroup type="single" defaultValue="live"><ToggleGroupItem value="live">Live</ToggleGroupItem></ToggleGroup>',
);
add(
	"pagination",
	"Page controls.",
	() => <Pagination page={1} pageCount={10} />,
	"<Pagination page={1} />",
);
add(
	"breadcrumbs",
	"Hierarchical location.",
	() => <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />,
	"<Breadcrumbs />",
);
add(
	"table",
	"Tabular data.",
	() => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Atlas</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	),
	"<Table />",
);
add(
	"data-table",
	"Sortable data table.",
	() => (
		<DataTable
			data={[{ name: "Atlas" }]}
			columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
		/>
	),
	'<DataTable data={[{ name: "Atlas" }]} columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]} />',
	[
		{ name: "data", type: "T[]" },
		{ name: "columns", type: "DataTableColumn<T>[]" },
		{ name: "filter", type: "string" },
	],
);
add(
	"table-of-contents",
	"On-this-page list.",
	() => (
		<TableOfContents>
			<TableOfContentsItem active>Intro</TableOfContentsItem>
		</TableOfContents>
	),
	"<TableOfContents />",
);
add(
	"grid",
	"Simple grid.",
	() => (
		<Grid>
			<GridItem>1</GridItem>
			<GridItem>2</GridItem>
		</Grid>
	),
	"<Grid />",
);
add(
	"toolbar",
	"Compose explicit toolbar controls into one grouped card.",
	() => (
		<Toolbar className="w-full max-w-md">
			<Toolbar.Input aria-label="Search records" placeholder="Search..." className="flex-1" />
			<Toolbar.Button icon={<Search />} aria-label="Search" />
			<Toolbar.Button icon={<Plus />} aria-label="Add" />
		</Toolbar>
	),
	'<Toolbar><Toolbar.Input placeholder="Search..." /><Toolbar.Button aria-label="Search" /></Toolbar>',
);
add(
	"toast",
	"Transient notification.",
	() => <Button onClick={() => toast("Saved")}>Toast</Button>,
	"<Button onClick={() => toast('Saved')}>Toast</Button>",
	[{ name: "message", type: "string" }],
	`import { Button } from "@nocoo/basalt/components/button";
import { toast } from "@nocoo/basalt/components/toast";

export default function Example() {
	return <Button onClick={() => toast("Saved")}>Toast</Button>;
}`,
);
function DialogHeroDemo() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Delete</Button>
			</DialogTrigger>
			<DialogContent>
				<div className="mb-4 flex items-start justify-between gap-4">
					<DialogTitle>Delete Resource?</DialogTitle>
					<DialogClose asChild>
						<Button variant="outline" size="icon" aria-label="Close">
							<X />
						</Button>
					</DialogClose>
				</div>
				<DialogDescription>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
					ut labore et dolore magna aliqua.
				</DialogDescription>
				<div className="mt-8 flex justify-end gap-2">
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button variant="destructive">Delete</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}
add(
	"dialog",
	"A window overlaid on the primary window, rendering the content underneath inert.",
	() => <DialogHeroDemo />,
	"<Dialog><DialogTrigger asChild><Button>Delete</Button></DialogTrigger><DialogContent><DialogTitle>Delete Resource?</DialogTitle></DialogContent></Dialog>",
	[
		{
			name: "size",
			type: '"sm" | "base" | "lg" | "xl"',
			default: '"base"',
			description: "Fixed desktop width. Overflowing content scrolls inside the panel.",
		},
		{
			name: "disablePointerDismissal",
			type: "boolean",
			default: "false",
			description: "When true, clicking outside does not close the dialog.",
		},
		{ name: "className", type: "string" },
	],
	`import { Button } from "@nocoo/basalt/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";

export default function Example() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Delete</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>Delete Resource?</DialogTitle>
				<DialogDescription>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				</DialogDescription>
				<div className="mt-8 flex justify-end gap-2">
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button variant="destructive">Delete</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}`,
);
if (extra.dialog) {
	extra.dialog.docs.source = {
		repo: "kumo",
		sha: "1159868dfe32",
		file: "packages/kumo/src/components/dialog/dialog.tsx",
	};
}
add(
	"alert-dialog",
	"Confirm destructive work. Not dismissible by clicking outside.",
	() => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">Delete Account</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-basalt-destructive/20">
						<AlertTriangle className="size-5 text-basalt-destructive" />
					</div>
					<AlertDialogTitle className="text-xl">Delete Account?</AlertDialogTitle>
				</div>
				<AlertDialogDescription>
					This action cannot be undone. All your data will be permanently removed from our servers.
				</AlertDialogDescription>
				<div className="mt-8 flex justify-end gap-2">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Delete Account</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	),
	"<AlertDialog />",
	[
		{
			name: "size",
			type: '"sm" | "base" | "lg" | "xl"',
			default: '"base"',
			description: "Fixed desktop width, shared with Dialog.",
		},
	],
);
add(
	"popover",
	"Floating panel.",
	() => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Open</Button>
			</PopoverTrigger>
			<PopoverContent>Details</PopoverContent>
		</Popover>
	),
	'<Popover><PopoverTrigger asChild><Button variant="outline">Open</Button></PopoverTrigger></Popover>',
);
add(
	"dropdown-menu",
	"Action menu.",
	() => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>Copy</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
	'<DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Open</Button></DropdownMenuTrigger></DropdownMenu>',
);
add(
	"select",
	"Choose one option.",
	() => (
		<Select>
			<SelectTrigger aria-label="Version">
				<SelectValue placeholder="Select version" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="1">v1</SelectItem>
			</SelectContent>
		</Select>
	),
	"<Select />",
);
add(
	"sheet",
	"Side panel.",
	() => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetTitle>Panel</SheetTitle>
			</SheetContent>
		</Sheet>
	),
	'<Sheet><SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger></Sheet>',
);
add(
	"hover-card",
	"Preview on hover.",
	() => (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="outline">Hover</Button>
			</HoverCardTrigger>
			<HoverCardContent>Preview</HoverCardContent>
		</HoverCard>
	),
	"<HoverCard />",
);
add(
	"context-menu",
	"Right-click menu.",
	() => (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<Button variant="outline">Right click</Button>
			</ContextMenuTrigger>
			<ContextMenuPanel>
				<ContextMenuItem>Copy</ContextMenuItem>
			</ContextMenuPanel>
		</ContextMenu>
	),
	"<ContextMenu />",
);
add(
	"combobox",
	"Searchable select.",
	() => <Combobox items={["Apple", "Banana"]} placeholder="Select…" />,
	'<Combobox items={["Apple", "Banana"]} />',
	[
		{ name: "items", type: "string[]" },
		{ name: "value", type: "string" },
		{ name: "defaultValue", type: "string" },
		{ name: "onValueChange", type: "(value: string) => void" },
		{ name: "name", type: "string" },
		{ name: "placeholder", type: "string" },
	],
);
add(
	"autocomplete",
	"Typeahead list.",
	() => <Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />,
	"<Autocomplete />",
);
add("date-picker", "Pick a date.", () => <DatePicker aria-label="Date" />, "<DatePicker />");
function CommandPaletteDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button
				variant="outline"
				icon={<Search />}
				className="w-full max-w-sm justify-start font-normal text-basalt-muted-foreground"
				onClick={() => setOpen(true)}
			>
				Search pages...
				<kbd className="pointer-events-none ml-auto rounded-sm border border-basalt-border bg-basalt-card px-1.5 py-0.5 text-[10px] font-medium text-basalt-muted-foreground">
					⌘K
				</kbd>
			</Button>
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
}

add(
	"command-palette",
	"Search pages and commands.",
	() => <CommandPaletteDemo />,
	'<Button variant="outline">Search pages...</Button>',
);
add(
	"sidebar",
	"App chrome: L0 sidebar with an L1 content island that floats a corner shadow.",
	() => (
		<div className="flex h-56 w-full overflow-hidden bg-basalt-background">
			<Sidebar className="h-full min-h-0 w-40">Catalog</Sidebar>
			<div className="flex min-w-0 flex-1 flex-col p-2">
				<ContentIsland className="p-4">At a glance</ContentIsland>
			</div>
		</div>
	),
	"<Sidebar>Catalog</Sidebar>\n<ContentIsland>At a glance</ContentIsland>",
);
add(
	"flow",
	"Step flow.",
	() => (
		<Flow>
			<FlowNode>Step 1</FlowNode>
			<FlowNode>Step 2</FlowNode>
		</Flow>
	),
	"<Flow />",
);
add(
	"navigation-menu",
	"Site navigation.",
	() => (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
	"<NavigationMenu />",
);
add(
	"menu-bar",
	"Desktop menu bar.",
	() => (
		<MenuBarRoot>
			<MenuBarMenu>
				<MenuBarTrigger>File</MenuBarTrigger>
			</MenuBarMenu>
		</MenuBarRoot>
	),
	"<MenuBar />",
);
add("line", "Line series.", () => <LineChart />, "<LineChart />");
add("bar", "Bar series.", () => <BarChart />, "<BarChart />");
add("area", "Area series.", () => <AreaChart />, "<AreaChart />");
add("donut", "Donut series.", () => <DonutChart />, "<DonutChart />");
add("sparkline", "Compact line.", () => <Sparkline />, "<Sparkline />");
add("gauge", "Radial-style meter.", () => <Gauge />, "<Gauge />");
add("stat-card", "KPI card.", () => <StatCard />, "<StatCard />");
add("palette", "Chart colors.", () => <ChartPalette />, "<ChartPalette />");
add("slot-bar", "Slot bar.", () => <SlotBarChart />, "<SlotBarChart />");
add("grouped-bar", "Grouped bars.", () => <GroupedBarChart />, "<GroupedBarChart />");
add("stacked-bar", "Stacked bars.", () => <StackedBarChart />, "<StackedBarChart />");
add("heatmap-calendar", "Calendar heatmap.", () => <HeatmapCalendar />, "<HeatmapCalendar />");
add(
	"radar",
	"Radar series.",
	() => <RadarChart />,
	'<RadarChart data={[{ subject: "Speed", value: 80 }]} />',
	[
		{ name: "data", type: "RadarPoint[]" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"funnel",
	"Funnel series.",
	() => <FunnelChart />,
	'<FunnelChart data={[{ name: "Visits", value: 2400 }]} />',
	[
		{ name: "data", type: "NamedValue[]" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"bullet",
	"Bullet chart.",
	() => <BulletChart />,
	'<BulletChart data={[{ name: "Revenue", value: 68, target: 80 }]} />',
	[
		{ name: "data", type: "BulletPoint[]" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"timeline",
	"Timeline.",
	() => <Timeline />,
	'<Timeline items={[{ id: "created", title: "Created", at: "Mon" }]} />',
	[
		{ name: "items", type: "{ id?: string; title: string; at?: string }[]" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"sankey",
	"Sankey-style flow.",
	() => <SankeyChart />,
	'<SankeyChart data={{ nodes: [{ name: "In" }, { name: "Out" }], links: [{ source: 0, target: 1, value: 10 }] }} />',
	[
		{ name: "data", type: "SankeyData" },
		{ name: "ariaLabel", type: "string" },
	],
);
add("item-list", "Simple list.", () => <ItemList />, "<ItemList />");
add(
	"date-navigation",
	"Date control.",
	() => <DateNavigation aria-label="Date" />,
	"<DateNavigation />",
);
add("charts", "Chart overview.", () => <Charts />, "<Charts />");
add("chart-colors", "Chart color tokens.", () => <Colors />, "<Colors />");
add("timeseries", "Time series.", () => <Timeseries />, "<Timeseries />");
add("custom-chart", "Custom chart.", () => <CustomChart />, "<CustomChart />");

export const EXTRA_DEMOS: Record<string, ComponentType> = Object.fromEntries(
	Object.entries(extra).map(([slug, value]) => [slug, value.demo]),
);

export const EXTRA_DOCS: Record<string, CatalogDocs> = Object.fromEntries(
	Object.entries(extra).map(([slug, value]) => [slug, value.docs]),
);

export const EXTRA_EXAMPLES: Record<
	string,
	{ title: string; code: string; render: ComponentType }[]
> = Object.fromEntries(
	Object.entries(extra).map(([slug, value]) => [
		slug,
		[{ title: "Default", code: value.docs.usage, render: value.demo }],
	]),
);
