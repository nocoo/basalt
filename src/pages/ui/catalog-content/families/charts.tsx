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
import type { ComponentType } from "react";
import { CATALOG, type CatalogEntry, catalogImportPath } from "../../catalog";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import {
	type CatalogApiProp,
	type CatalogDocsDraft,
	provenanceFromLegacy,
} from "../../catalog-source";

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

const XY = [{ x: "Mon", y: 12, y2: 8 }];

add(
	"line",
	"Line series.",
	() => <LineChart data={XY} />,
	"<LineChart data={[{ x: 'Mon', y: 12 }]} />",
);
add(
	"bar",
	"Bar series.",
	() => <BarChart data={XY} />,
	"<BarChart data={[{ x: 'Mon', y: 12 }]} />",
);
add(
	"area",
	"Area series.",
	() => <AreaChart data={XY} />,
	"<AreaChart data={[{ x: 'Mon', y: 12 }]} />",
);
add(
	"donut",
	"Donut series.",
	() => <DonutChart data={[{ name: "A", value: 40 }]} />,
	'<DonutChart data={[{ name: "A", value: 40 }]} />',
);
add(
	"sparkline",
	"Compact line.",
	() => <Sparkline data={XY} />,
	"<Sparkline data={[{ x: 'Mon', y: 12 }]} />",
);
add("gauge", "Radial-style meter.", () => <Gauge value={72} />, "<Gauge value={72} />");
add(
	"stat-card",
	"KPI card.",
	() => <StatCard label="Requests" value="12.4k" />,
	'<StatCard label="Requests" value="12.4k" />',
);
add("palette", "Chart colors.", () => <ChartPalette />, "<ChartPalette />");
add(
	"slot-bar",
	"Slot bar.",
	() => <SlotBarChart data={XY} />,
	"<SlotBarChart data={[{ x: 'Mon', y: 12 }]} />",
);
add(
	"grouped-bar",
	"Grouped bars.",
	() => <GroupedBarChart data={XY} />,
	"<GroupedBarChart data={[{ x: 'Mon', y: 12 }]} />",
);
add(
	"stacked-bar",
	"Stacked bars.",
	() => <StackedBarChart data={XY} />,
	"<StackedBarChart data={[{ x: 'Mon', y: 12 }]} />",
);
add(
	"heatmap-calendar",
	"Calendar heatmap.",
	() => <HeatmapCalendar values={[1, 2, 3]} />,
	"<HeatmapCalendar values={[1, 2, 3]} />",
);
add(
	"radar",
	"Radar series.",
	() => <RadarChart data={[{ subject: "Speed", value: 80 }]} />,
	'<RadarChart data={[{ subject: "Speed", value: 80 }]} />',
	[
		{ name: "data", type: "RadarPoint[]" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"funnel",
	"Funnel series.",
	() => <FunnelChart data={[{ name: "Visits", value: 2400 }]} />,
	'<FunnelChart data={[{ name: "Visits", value: 2400 }]} />',
	[
		{ name: "data", type: "NamedValue[]" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"bullet",
	"Bullet chart.",
	() => <BulletChart data={[{ name: "Revenue", value: 68, target: 80 }]} />,
	'<BulletChart data={[{ name: "Revenue", value: 68, target: 80 }]} />',
	[
		{ name: "data", type: "BulletPoint[]" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"timeline",
	"Timeline.",
	() => <Timeline items={[{ id: "created", title: "Created", at: "Mon" }]} />,
	'<Timeline items={[{ id: "created", title: "Created", at: "Mon" }]} />',
	[
		{ name: "items", type: "{ id?: string; title: string; at?: string }[]" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"sankey",
	"Sankey-style flow.",
	() => (
		<SankeyChart
			data={{
				nodes: [{ name: "In" }, { name: "Out" }],
				links: [{ source: 0, target: 1, value: 10 }],
			}}
		/>
	),
	'<SankeyChart data={{ nodes: [{ name: "In" }, { name: "Out" }], links: [{ source: 0, target: 1, value: 10 }] }} />',
	[
		{ name: "data", type: "SankeyData" },
		{ name: "ariaLabel", type: "string" },
	],
);
add(
	"item-list",
	"Simple list.",
	() => <ItemList items={[{ label: "North" }]} />,
	'<ItemList items={[{ label: "North" }]} />',
);
add(
	"date-navigation",
	"Date control.",
	() => <DateNavigation aria-label="Date" />,
	"<DateNavigation />",
);
add(
	"charts",
	"Chart overview.",
	() => <Charts data={XY} />,
	"<Charts data={[{ x: 'Mon', y: 12 }]} />",
);
add("chart-colors", "Chart color tokens.", () => <Colors />, "<Colors />");
add(
	"timeseries",
	"Time series.",
	() => <Timeseries data={XY} />,
	"<Timeseries data={[{ x: 'Mon', y: 12 }]} />",
);
add(
	"custom-chart",
	"Custom chart.",
	() => <CustomChart data={XY} />,
	"<CustomChart data={[{ x: 'Mon', y: 12 }]} />",
);

export default catalogContentFamily(
	Object.fromEntries(
		Object.entries(extra).map(([slug, value]) => [
			slug,
			{
				docs: value.docs,
				examples: [
					{
						id: catalogScenarioId(slug, "default"),
						title: "Default",
						code: value.docs.usage,
						render: value.demo,
					},
				],
			},
		]),
	),
);
