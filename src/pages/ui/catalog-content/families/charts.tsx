import { catalogContentFamily } from "../../catalog-content";
import { type CatalogDocsDraft, provenanceFromLegacy } from "../../catalog-source";
import { AREA_EXAMPLES } from "../../examples/area";
import { BAR_EXAMPLES } from "../../examples/bar";
import { BULLET_EXAMPLES } from "../../examples/bullet";
import { CHART_COLORS_EXAMPLES } from "../../examples/chart-colors";
import { CHARTS_EXAMPLES } from "../../examples/charts";
import { CUSTOM_CHART_EXAMPLES } from "../../examples/custom-chart";
import { DATE_NAVIGATION_EXAMPLES } from "../../examples/date-navigation";
import { DONUT_EXAMPLES } from "../../examples/donut";
import { FUNNEL_EXAMPLES } from "../../examples/funnel";
import { GAUGE_EXAMPLES } from "../../examples/gauge";
import { GROUPED_BAR_EXAMPLES } from "../../examples/grouped-bar";
import { HEATMAP_CALENDAR_EXAMPLES } from "../../examples/heatmap-calendar";
import { ITEM_LIST_EXAMPLES } from "../../examples/item-list";
import { LINE_EXAMPLES } from "../../examples/line";
import { PALETTE_EXAMPLES } from "../../examples/palette";
import { RADAR_EXAMPLES } from "../../examples/radar";
import { SANKEY_EXAMPLES } from "../../examples/sankey";
import { SLOT_BAR_EXAMPLES } from "../../examples/slot-bar";
import { SPARKLINE_EXAMPLES } from "../../examples/sparkline";
import { STACKED_BAR_EXAMPLES } from "../../examples/stacked-bar";
import { STAT_CARD_EXAMPLES } from "../../examples/stat-card";
import { TIMELINE_EXAMPLES } from "../../examples/timeline";
import { TIMESERIES_EXAMPLES } from "../../examples/timeseries";
import { API as areaApi } from "../../generated/catalog-api/area";
import { API as barApi } from "../../generated/catalog-api/bar";
import { API as bulletApi } from "../../generated/catalog-api/bullet";
import { API as chartColorsApi } from "../../generated/catalog-api/chart-colors";
import { API as chartsApi } from "../../generated/catalog-api/charts";
import { API as customChartApi } from "../../generated/catalog-api/custom-chart";
import { API as dateNavigationApi } from "../../generated/catalog-api/date-navigation";
import { API as donutApi } from "../../generated/catalog-api/donut";
import { API as funnelApi } from "../../generated/catalog-api/funnel";
import { API as gaugeApi } from "../../generated/catalog-api/gauge";
import { API as groupedBarApi } from "../../generated/catalog-api/grouped-bar";
import { API as heatmapCalendarApi } from "../../generated/catalog-api/heatmap-calendar";
import { API as itemListApi } from "../../generated/catalog-api/item-list";
import { API as lineApi } from "../../generated/catalog-api/line";
import { API as paletteApi } from "../../generated/catalog-api/palette";
import { API as radarApi } from "../../generated/catalog-api/radar";
import { API as sankeyApi } from "../../generated/catalog-api/sankey";
import { API as slotBarApi } from "../../generated/catalog-api/slot-bar";
import { API as sparklineApi } from "../../generated/catalog-api/sparkline";
import { API as stackedBarApi } from "../../generated/catalog-api/stacked-bar";
import { API as statCardApi } from "../../generated/catalog-api/stat-card";
import { API as timelineApi } from "../../generated/catalog-api/timeline";
import { API as timeseriesApi } from "../../generated/catalog-api/timeseries";

const EXTRA_PROVENANCE = provenanceFromLegacy({
	repo: "pew",
	sha: "97a890fabe6e",
	file: "packages/web/src/components",
});

function extraDocs(
	name: string,
	slug: string,
	description: string,
	sample: string,
	usage?: string,
): CatalogDocsDraft {
	return {
		description,
		usage:
			usage ??
			`import { ${name} } from "@nocoo/basalt/charts/${slug}";\n\nexport default function Example() {\n\treturn ${sample};\n}`,
		variants: [],
		api: [{ name, props: [{ name: "className", type: "string", description: "className" }] }],
		provenance: EXTRA_PROVENANCE,
	};
}

export default catalogContentFamily({
	line: {
		docs: {
			...extraDocs(
				"LineChart",
				"line",
				"Line series.",
				"<LineChart data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: lineApi,
		},
		examples: LINE_EXAMPLES,
	},
	bar: {
		docs: {
			...extraDocs("BarChart", "bar", "Bar series.", "<BarChart data={[{ x: 'Mon', y: 12 }]} />"),
			api: barApi,
		},
		examples: BAR_EXAMPLES,
	},
	area: {
		docs: {
			...extraDocs(
				"AreaChart",
				"area",
				"Area series.",
				"<AreaChart data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: areaApi,
		},
		examples: AREA_EXAMPLES,
	},
	donut: {
		docs: {
			...extraDocs(
				"DonutChart",
				"donut",
				"Donut series.",
				'<DonutChart data={[{ name: "A", value: 40 }]} />',
			),
			api: donutApi,
		},
		examples: DONUT_EXAMPLES,
	},
	sparkline: {
		docs: {
			...extraDocs(
				"Sparkline",
				"sparkline",
				"Compact line.",
				"<Sparkline data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: sparklineApi,
		},
		examples: SPARKLINE_EXAMPLES,
	},
	gauge: {
		docs: {
			...extraDocs("Gauge", "gauge", "Radial-style meter.", "<Gauge value={72} />"),
			api: gaugeApi,
		},
		examples: GAUGE_EXAMPLES,
	},
	"stat-card": {
		docs: {
			...extraDocs(
				"StatCard",
				"stat-card",
				"KPI card.",
				'<StatCard label="Requests" value="12.4k" />',
			),
			api: statCardApi,
		},
		examples: STAT_CARD_EXAMPLES,
	},
	palette: {
		docs: {
			...extraDocs("ChartPalette", "palette", "Chart colors.", "<ChartPalette />"),
			api: paletteApi,
		},
		examples: PALETTE_EXAMPLES,
	},
	"slot-bar": {
		docs: {
			...extraDocs(
				"SlotBarChart",
				"slot-bar",
				"Slot bar.",
				"<SlotBarChart data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: slotBarApi,
		},
		examples: SLOT_BAR_EXAMPLES,
	},
	"grouped-bar": {
		docs: {
			...extraDocs(
				"GroupedBarChart",
				"grouped-bar",
				"Grouped bars.",
				"<GroupedBarChart data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: groupedBarApi,
		},
		examples: GROUPED_BAR_EXAMPLES,
	},
	"stacked-bar": {
		docs: {
			...extraDocs(
				"StackedBarChart",
				"stacked-bar",
				"Stacked bars.",
				"<StackedBarChart data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: stackedBarApi,
		},
		examples: STACKED_BAR_EXAMPLES,
	},
	"heatmap-calendar": {
		docs: {
			...extraDocs(
				"HeatmapCalendar",
				"heatmap-calendar",
				"Calendar heatmap.",
				"<HeatmapCalendar values={[1, 2, 3]} />",
			),
			api: heatmapCalendarApi,
		},
		examples: HEATMAP_CALENDAR_EXAMPLES,
	},
	radar: {
		docs: {
			...extraDocs(
				"RadarChart",
				"radar",
				"Radar series.",
				'<RadarChart data={[{ subject: "Speed", value: 80 }]} />',
			),
			api: radarApi,
		},
		examples: RADAR_EXAMPLES,
	},
	funnel: {
		docs: {
			...extraDocs(
				"FunnelChart",
				"funnel",
				"Funnel series.",
				'<FunnelChart data={[{ name: "Visits", value: 2400 }]} />',
			),
			api: funnelApi,
		},
		examples: FUNNEL_EXAMPLES,
	},
	bullet: {
		docs: {
			...extraDocs(
				"BulletChart",
				"bullet",
				"Bullet chart.",
				'<BulletChart data={[{ name: "Revenue", value: 68, target: 80 }]} />',
			),
			api: bulletApi,
		},
		examples: BULLET_EXAMPLES,
	},
	timeline: {
		docs: {
			...extraDocs(
				"Timeline",
				"timeline",
				"Timeline.",
				'<Timeline items={[{ id: "created", title: "Created", at: "Mon" }]} />',
			),
			api: timelineApi,
		},
		examples: TIMELINE_EXAMPLES,
	},
	sankey: {
		docs: {
			...extraDocs(
				"SankeyChart",
				"sankey",
				"Sankey-style flow.",
				'<SankeyChart data={{ nodes: [{ name: "In" }, { name: "Out" }], links: [{ source: 0, target: 1, value: 10 }] }} />',
			),
			api: sankeyApi,
		},
		examples: SANKEY_EXAMPLES,
	},
	"item-list": {
		docs: {
			...extraDocs(
				"ItemList",
				"item-list",
				"Simple list.",
				'<ItemList items={[{ label: "North" }]} />',
			),
			api: itemListApi,
		},
		examples: ITEM_LIST_EXAMPLES,
	},
	"date-navigation": {
		docs: {
			...extraDocs("DateNavigation", "date-navigation", "Date control.", "<DateNavigation />"),
			api: dateNavigationApi,
		},
		examples: DATE_NAVIGATION_EXAMPLES,
	},
	charts: {
		docs: {
			...extraDocs(
				"Charts",
				"charts",
				"Chart overview.",
				"<Charts data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: chartsApi,
		},
		examples: CHARTS_EXAMPLES,
	},
	"chart-colors": {
		docs: {
			...extraDocs("Colors", "chart-colors", "Chart color tokens.", "<Colors />"),
			api: chartColorsApi,
		},
		examples: CHART_COLORS_EXAMPLES,
	},
	timeseries: {
		docs: {
			...extraDocs(
				"Timeseries",
				"timeseries",
				"Time series.",
				"<Timeseries data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: timeseriesApi,
		},
		examples: TIMESERIES_EXAMPLES,
	},
	"custom-chart": {
		docs: {
			...extraDocs(
				"CustomChart",
				"custom-chart",
				"Custom chart.",
				"<CustomChart data={[{ x: 'Mon', y: 12 }]} />",
			),
			api: customChartApi,
		},
		examples: CUSTOM_CHART_EXAMPLES,
	},
});
