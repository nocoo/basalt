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
import { AppHeader } from "@nocoo/basalt/components/app-header";
import { Button } from "@nocoo/basalt/components/button";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { Flow, FlowNode } from "@nocoo/basalt/components/flow";
import { Grid, GridItem } from "@nocoo/basalt/components/grid";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import type { ComponentType } from "react";
import { CATALOG, type CatalogEntry, catalogImportPath } from "./catalog";
import { type CatalogScenario, catalogScenarioId } from "./catalog-scenario";
import { type CatalogApiProp, type CatalogDocsDraft, provenanceFromLegacy } from "./catalog-source";

const SRC = { repo: "pew", sha: "97a890fabe6e", file: "packages/web/src/components" };

function page(
	entry: CatalogEntry,
	description: string,
	Demo: ComponentType,
	sample: string,
	props: CatalogApiProp[] = [{ name: "className", type: "string" }],
	usage?: string,
): { demo: ComponentType; docs: CatalogDocsDraft } {
	return {
		demo: Demo,
		docs: {
			description,
			usage:
				usage ??
				`import { ${entry.name.replace(/ /g, "")} } from "${catalogImportPath(entry)}";\n\nexport default function Example() {\n\treturn ${sample};\n}`,
			variants: [],
			api: [
				{
					name: entry.name.replace(/ /g, ""),
					props: props.map((prop) => ({
						...prop,
						description: prop.description ?? prop.name,
					})),
				},
			],
			provenance: provenanceFromLegacy(SRC),
		},
	};
}

const extra: Record<string, { demo: ComponentType; docs: CatalogDocsDraft }> = {};

function add(
	slug: string,
	description: string,
	Demo: ComponentType,
	sample: string,
	props?: CatalogApiProp[],
	usage?: string,
) {
	const entry = CATALOG.find((item) => item.slug === slug);
	if (!entry) {
		return;
	}
	extra[slug] = page(entry, description, Demo, sample, props, usage);
}

add(
	"table",
	"Tabular data with a header bar and striped rows.",
	() => (
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
	"<Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Report 1</TableCell><TableCell>Active</TableCell></TableRow></TableBody></Table>",
	undefined,
	`import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";

export default function Example() {
	return (
		<Table>
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
			</TableBody>
		</Table>
	);
}`,
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
	"grid",
	"Simple grid.",
	() => (
		<Grid className="w-full max-w-sm">
			<GridItem>1</GridItem>
			<GridItem>2</GridItem>
			<GridItem>3</GridItem>
			<GridItem>4</GridItem>
		</Grid>
	),
	"<Grid><GridItem>1</GridItem><GridItem>2</GridItem><GridItem>3</GridItem><GridItem>4</GridItem></Grid>",
	undefined,
	`import { Grid, GridItem } from "@nocoo/basalt/components/grid";

export default function Example() {
	return (
		<Grid>
			<GridItem>1</GridItem>
			<GridItem>2</GridItem>
			<GridItem>3</GridItem>
			<GridItem>4</GridItem>
		</Grid>
	);
}`,
);
add(
	"page-header",
	"App header with breadcrumbs and title.",
	() => (
		<AppHeader
			breadcrumbs={[{ href: "#", label: "Examples" }]}
			title="Dashboard"
			actions={<Button variant="ghost">Action</Button>}
		/>
	),
	'<AppHeader breadcrumbs={[{ href: "/", label: "Examples" }]} title="Dashboard" />',
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
	"<Flow><FlowNode>Step 1</FlowNode><FlowNode>Step 2</FlowNode></Flow>",
	undefined,
	`import { Flow, FlowNode } from "@nocoo/basalt/components/flow";

export default function Example() {
	return (
		<Flow>
			<FlowNode>Step 1</FlowNode>
			<FlowNode>Step 2</FlowNode>
		</Flow>
	);
}`,
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

export const EXTRA_DOCS: Record<string, CatalogDocsDraft> = Object.fromEntries(
	Object.entries(extra).map(([slug, value]) => [slug, value.docs]),
);

export const EXTRA_EXAMPLES: Record<string, CatalogScenario[]> = Object.fromEntries(
	Object.entries(extra).map(([slug, value]) => [
		slug,
		[
			{
				id: catalogScenarioId(slug, "default"),
				title: "Default",
				code: value.docs.usage,
				render: value.demo,
			},
		],
	]),
);
