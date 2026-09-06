import { Button, Field, Text, ThemeProvider } from "@nocoo/basalt";
import { AreaChart, type AreaChartProps } from "@nocoo/basalt/charts/area";
import { BarChart, type BarChartProps } from "@nocoo/basalt/charts/bar";
import { Charts, type ChartsProps } from "@nocoo/basalt/charts/charts";
import { CustomChart, type CustomChartProps } from "@nocoo/basalt/charts/custom-chart";
import { DonutChart } from "@nocoo/basalt/charts/donut";
import { GroupedBarChart, type GroupedBarChartProps } from "@nocoo/basalt/charts/grouped-bar";
import { LineChart, type LineChartProps } from "@nocoo/basalt/charts/line";
import type { ChartSeriesDescriptor, XYPoint } from "@nocoo/basalt/charts/series";
import { SlotBarChart, type SlotBarChartProps } from "@nocoo/basalt/charts/slot-bar";
import { Sparkline, type SparklineProps } from "@nocoo/basalt/charts/sparkline";
import { StackedBarChart, type StackedBarChartProps } from "@nocoo/basalt/charts/stacked-bar";
import { Timeseries, type TimeseriesProps } from "@nocoo/basalt/charts/timeseries";
import { Button as GranularButton } from "@nocoo/basalt/components/button";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { Field as GranularField } from "@nocoo/basalt/components/field";
import { Text as GranularText } from "@nocoo/basalt/components/text";
import { ThemeProvider as GranularThemeProvider } from "@nocoo/basalt/providers/theme";

export const consumer = {
	Button,
	Field,
	Text,
	ThemeProvider,
	GranularButton,
	GranularField,
	GranularText,
	GranularThemeProvider,
	DonutChart,
	DatePicker,
	DataTable,
	LineChart,
	BarChart,
	AreaChart,
	GroupedBarChart,
	StackedBarChart,
	Charts,
	Timeseries,
	CustomChart,
	Sparkline,
	SlotBarChart,
};

// =========================================================================
// Type Tests: 17a Dynamic Series & Numeric Key Inference across all 8 charts
// =========================================================================

// 1. Default XYPoint usage (backward compatibility)
const defaultPoints: XYPoint[] = [
	{ x: "Jan", y: 10, y2: 20, y3: 30 },
	{ x: "Feb", y: 15, y2: 25 },
];

const _defaultLine: LineChartProps = {
	data: defaultPoints,
	series: [{ key: "y" }, { key: "y2" }, { key: "y3" }],
};

const _defaultBar: BarChartProps = {
	data: defaultPoints,
	series: [{ key: "y" }],
};

const _defaultArea: AreaChartProps = {
	data: defaultPoints,
	series: [{ key: "y" }, { key: "y2" }],
	stacked: true,
	stackOffset: "expand",
};

const _defaultGrouped: GroupedBarChartProps = {
	data: defaultPoints,
	series: [{ key: "y" }, { key: "y2" }],
};

const _defaultStacked: StackedBarChartProps = {
	data: defaultPoints,
	series: [{ key: "y" }, { key: "y2" }, { key: "y3" }],
	stackOffset: "expand",
};

const _defaultCharts: ChartsProps = {
	data: defaultPoints,
	series: [{ key: "y" }],
};

const _defaultTimeseries: TimeseriesProps = {
	data: defaultPoints,
	series: [{ key: "y" }],
};

const _defaultCustom: CustomChartProps = {
	data: defaultPoints,
	series: [{ key: "y" }],
};

const _defaultSpark: SparklineProps = {
	data: defaultPoints,
	series: [{ key: "y" }],
};

const _defaultSlot: SlotBarChartProps = {
	data: defaultPoints,
	series: [{ key: "y" }],
};

// 2. Dynamic multi-key (>3 keys) data with nullable/optional numbers, text & boolean metadata
interface DynamicTelemetry {
	x: string;
	sensorAlpha: number;
	sensorBeta: number | null;
	sensorGamma?: number;
	sensorDelta: number;
	sensorEpsilon: number;
	statusText: string;
	isActive: boolean;
}

const dynamicRows: DynamicTelemetry[] = [
	{
		x: "00:00",
		sensorAlpha: 12.5,
		sensorBeta: null,
		sensorGamma: 44.1,
		sensorDelta: -3.2,
		sensorEpsilon: 88,
		statusText: "nominal",
		isActive: true,
	},
	{
		x: "01:00",
		sensorAlpha: 14.1,
		sensorBeta: 9.2,
		sensorGamma: undefined,
		sensorDelta: -1.0,
		sensorEpsilon: 91,
		statusText: "degraded",
		isActive: false,
	},
];

// Valid dynamic props across XY charts with >3 keys
export const validDynamicLine: LineChartProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [
		{ key: "sensorAlpha", label: "Alpha" },
		{ key: "sensorBeta", label: "Beta" },
		{ key: "sensorGamma", label: "Gamma" },
		{ key: "sensorDelta", label: "Delta" },
		{ key: "sensorEpsilon", label: "Epsilon" },
	],
	xValueFormatter: (val: string | number) => `T+${String(val)}`,
	valueFormatter: (val: number) => `${val.toFixed(1)}°C`,
	yDomain: ["auto", "auto"],
	legend: ({ items }: { items: Array<ChartSeriesDescriptor<string>> }) =>
		items.map((i) => i.key).join(", "),
	customTooltip: ({ active, payload, label }) =>
		active ? `${String(label)}: ${payload?.length}` : null,
};

export const validDynamicArea: AreaChartProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [
		{ key: "sensorAlpha" },
		{ key: "sensorBeta" },
		{ key: "sensorGamma" },
		{ key: "sensorDelta" },
	],
	stacked: true,
	stackOffset: "expand",
};

export const validDynamicBar: BarChartProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [{ key: "sensorAlpha" }, { key: "sensorDelta" }],
};

export const validDynamicStacked: StackedBarChartProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [
		{ key: "sensorAlpha" },
		{ key: "sensorBeta" },
		{ key: "sensorDelta" },
		{ key: "sensorEpsilon" },
	],
	stackOffset: "expand",
};

export const validDynamicGrouped: GroupedBarChartProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [
		{ key: "sensorAlpha" },
		{ key: "sensorBeta" },
		{ key: "sensorGamma" },
		{ key: "sensorDelta" },
	],
};

export const validDynamicTimeseries: TimeseriesProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [{ key: "sensorAlpha" }, { key: "sensorBeta" }],
};

export const validDynamicCustom: CustomChartProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [{ key: "sensorAlpha" }],
};

export const validDynamicSpark: SparklineProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [{ key: "sensorDelta" }],
};

export const validDynamicSlot: SlotBarChartProps<DynamicTelemetry> = {
	data: dynamicRows,
	series: [{ key: "sensorEpsilon" }],
};

// 3. JSX direct generic inference tests
export const jsxDirectLine = (
	<LineChart
		data={dynamicRows}
		series={[
			{ key: "sensorAlpha" },
			{ key: "sensorBeta" },
			{ key: "sensorGamma" },
			{ key: "sensorDelta" },
			{ key: "sensorEpsilon" },
		]}
	/>
);

export const jsxDirectArea = (
	<AreaChart
		data={dynamicRows}
		series={[
			{ key: "sensorAlpha" },
			{ key: "sensorBeta" },
			{ key: "sensorGamma" },
			{ key: "sensorDelta" },
		]}
		stacked
		stackOffset="expand"
	/>
);

export const jsxDirectBar = (
	<BarChart data={dynamicRows} series={[{ key: "sensorAlpha" }, { key: "sensorDelta" }]} />
);

export const jsxDirectStacked = (
	<StackedBarChart
		data={dynamicRows}
		series={[{ key: "sensorAlpha" }, { key: "sensorBeta" }, { key: "sensorDelta" }]}
		stackOffset="expand"
	/>
);

export const jsxDirectGrouped = (
	<GroupedBarChart
		data={dynamicRows}
		series={[{ key: "sensorAlpha" }, { key: "sensorBeta" }, { key: "sensorGamma" }]}
	/>
);

// 4. Negative JSX type assertions: text, boolean, x, or misspelled keys must be rejected
export const jsxInvalidText = (
	<LineChart
		data={dynamicRows}
		series={[
			// @ts-expect-error text field 'statusText' is not a numeric series key
			{ key: "statusText" },
		]}
	/>
);

export const jsxInvalidBool = (
	<LineChart
		data={dynamicRows}
		series={[
			// @ts-expect-error boolean field 'isActive' is not a numeric series key
			{ key: "isActive" },
		]}
	/>
);

export const jsxInvalidX = (
	<LineChart
		data={dynamicRows}
		series={[
			// @ts-expect-error category axis 'x' is not a value series key
			{ key: "x" },
		]}
	/>
);

export const jsxInvalidTypo = (
	<LineChart
		data={dynamicRows}
		series={[
			// @ts-expect-error typo 'sensorAlpaha' is not a key on DynamicTelemetry
			{ key: "sensorAlpaha" },
		]}
	/>
);
