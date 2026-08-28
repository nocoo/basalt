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
	CommandInput,
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
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@nocoo/basalt/components/dialog";
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
import { Input } from "@nocoo/basalt/components/input";
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
import { Sidebar } from "@nocoo/basalt/components/sidebar";
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
import type { ComponentType } from "react";
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
add(
	"banner",
	"Inline status messages.",
	() => <Banner title="Notice" description="Something happened." />,
	"<Banner title='Notice' />",
);
add("loader", "Indicates a pending state.", () => <Loader />, "<Loader />");
add(
	"skeleton-line",
	"Placeholder lines while content loads.",
	() => <SkeletonLine minWidth={120} />,
	"<SkeletonLine />",
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
	"Show and hide a panel.",
	() => (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<Button variant="outline">Open</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>More</CollapsibleContent>
		</Collapsible>
	),
	'<Collapsible><CollapsibleTrigger asChild><Button variant="outline">Open</Button></CollapsibleTrigger></Collapsible>',
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
	"Grouped toggles.",
	() => (
		<ToggleGroup type="single">
			<ToggleGroupItem value="l">Left</ToggleGroupItem>
		</ToggleGroup>
	),
	"<ToggleGroup />",
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
	() => <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Docs" }]} />,
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
					<TableCell>Worker</TableCell>
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
			data={[{ name: "Worker" }]}
			columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
		/>
	),
	'<DataTable data={[{ name: "Worker" }]} columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]} />',
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
	"Compact tool cluster.",
	() => (
		<Toolbar>
			<Input aria-label="Search" placeholder="Search…" className="border-0 shadow-none" />
		</Toolbar>
	),
	"<Toolbar />",
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
add(
	"dialog",
	"Modal dialog.",
	() => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Open</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>Title</DialogTitle>
			</DialogContent>
		</Dialog>
	),
	'<Dialog><DialogTrigger asChild><Button variant="outline">Open</Button></DialogTrigger></Dialog>',
);
add(
	"alert-dialog",
	"Confirm destructive work.",
	() => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline">Delete</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>Delete resource</AlertDialogTitle>
				<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<AlertDialogAction>Delete</AlertDialogAction>
			</AlertDialogContent>
		</AlertDialog>
	),
	"<AlertDialog />",
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
add(
	"command-palette",
	"Command search.",
	() => (
		<CommandPalette>
			<CommandInput placeholder="Search" />
			<CommandList />
		</CommandPalette>
	),
	"<CommandPalette />",
);
add("sidebar", "App sidebar shell.", () => <Sidebar>Nav</Sidebar>, "<Sidebar />");
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
