import { AreaChart } from "@nocoo/basalt/charts/area";
import { BarChart } from "@nocoo/basalt/charts/bar";
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
import { AlertDialog, AlertDialogTrigger } from "@nocoo/basalt/components/alert-dialog";
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
import { ContextMenu, ContextMenuTrigger } from "@nocoo/basalt/components/context-menu";
import {
	DataTable,
	DataTableBody,
	DataTableCell,
	DataTableRow,
} from "@nocoo/basalt/components/data-table";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@nocoo/basalt/components/dialog";
import { DropdownMenu, DropdownMenuTrigger } from "@nocoo/basalt/components/dropdown-menu";
import { Empty } from "@nocoo/basalt/components/empty";
import { Flow, FlowNode } from "@nocoo/basalt/components/flow";
import { Grid, GridItem } from "@nocoo/basalt/components/grid";
import { HoverCard, HoverCardTrigger } from "@nocoo/basalt/components/hover-card";
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
import { Popover, PopoverTrigger } from "@nocoo/basalt/components/popover";
import { Select, SelectTrigger, SelectValue } from "@nocoo/basalt/components/select";
import { Sheet, SheetTrigger } from "@nocoo/basalt/components/sheet";
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
): { demo: ComponentType; docs: CatalogDocs } {
	return {
		demo: Demo,
		docs: {
			description,
			usage: `import { ${entry.name.replace(/ /g, "")} } from "${catalogImportPath(entry)}";\n\nexport default function Example() {\n\treturn ${sample};\n}`,
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

function add(slug: string, description: string, Demo: ComponentType, sample: string) {
	const entry = CATALOG.find((item) => item.slug === slug);
	if (!entry) {
		return;
	}
	extra[slug] = page(entry, description, Demo, sample);
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
			<CollapsibleTrigger>Open</CollapsibleTrigger>
			<CollapsibleContent>More</CollapsibleContent>
		</Collapsible>
	),
	"<Collapsible />",
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
	"Data table.",
	() => (
		<DataTable>
			<DataTableBody>
				<DataTableRow>
					<DataTableCell>Row</DataTableCell>
				</DataTableRow>
			</DataTableBody>
		</DataTable>
	),
	"<DataTable />",
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
);
add(
	"dialog",
	"Modal dialog.",
	() => (
		<Dialog>
			<DialogTrigger>Open</DialogTrigger>
			<DialogContent>
				<DialogTitle>Title</DialogTitle>
			</DialogContent>
		</Dialog>
	),
	"<Dialog />",
);
add(
	"alert-dialog",
	"Confirm destructive work.",
	() => (
		<AlertDialog>
			<AlertDialogTrigger>Delete</AlertDialogTrigger>
		</AlertDialog>
	),
	"<AlertDialog />",
);
add(
	"popover",
	"Floating panel.",
	() => (
		<Popover>
			<PopoverTrigger>Open</PopoverTrigger>
		</Popover>
	),
	"<Popover />",
);
add(
	"dropdown-menu",
	"Action menu.",
	() => (
		<DropdownMenu>
			<DropdownMenuTrigger>Open</DropdownMenuTrigger>
		</DropdownMenu>
	),
	"<DropdownMenu />",
);
add(
	"select",
	"Choose one option.",
	() => (
		<Select>
			<SelectTrigger aria-label="Version">
				<SelectValue placeholder="Select version" />
			</SelectTrigger>
		</Select>
	),
	"<Select />",
);
add(
	"sheet",
	"Side panel.",
	() => (
		<Sheet>
			<SheetTrigger>Open</SheetTrigger>
		</Sheet>
	),
	"<Sheet />",
);
add(
	"hover-card",
	"Preview on hover.",
	() => (
		<HoverCard>
			<HoverCardTrigger>Hover</HoverCardTrigger>
		</HoverCard>
	),
	"<HoverCard />",
);
add(
	"context-menu",
	"Right-click menu.",
	() => (
		<ContextMenu>
			<ContextMenuTrigger>Right click</ContextMenuTrigger>
		</ContextMenu>
	),
	"<ContextMenu />",
);
add(
	"combobox",
	"Searchable select.",
	() => <Combobox items={["Apple", "Banana"]} placeholder="Select…" />,
	"<Combobox />",
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
add("radar", "Radar series.", () => <RadarChart />, "<RadarChart />");
add("funnel", "Funnel series.", () => <FunnelChart />, "<FunnelChart />");
add("bullet", "Bullet chart.", () => <Gauge />, "<BulletChart />");
add(
	"timeline",
	"Timeline.",
	() => (
		<Timeline>
			<FlowNode>Event</FlowNode>
		</Timeline>
	),
	"<Timeline />",
);
add(
	"sankey",
	"Sankey-style flow.",
	() => (
		<SankeyChart>
			<FlowNode>In</FlowNode>
			<FlowNode>Out</FlowNode>
		</SankeyChart>
	),
	"<SankeyChart />",
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
