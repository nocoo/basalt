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
import { BatteryMeter } from "@nocoo/basalt/components/battery-meter";
import { Button as GranularButton } from "@nocoo/basalt/components/button";
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { Field as GranularField } from "@nocoo/basalt/components/field";
import { ResourceList } from "@nocoo/basalt/components/resource-list";
import { Text as GranularText } from "@nocoo/basalt/components/text";
import { ThemeProvider as GranularThemeProvider } from "@nocoo/basalt/providers/theme";
import { createRef } from "react";

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

// Resource composition retains readable legacy columns and infers row callbacks.
const resourceColumns: DataTableColumn<{ id: string; count: bigint }>[] = [
	{
		id: "count",
		header: "Count",
		accessor: (row) => row.count,
		sortValue: (row) => row.count,
		headerContent: <strong>Count</strong>,
		width: 180,
		cellClassName: "numeric",
	},
];
export const readableHeader: string = resourceColumns[0].header.toUpperCase();
export const serverResourceTable = (
	<ResourceList title="Resources" data={[]} toolbar={<BatteryMeter value={42} label="Gateway" />}>
		<DataTable
			data={[{ id: "a", count: 12n }]}
			columns={resourceColumns}
			sort={null}
			manualPagination
			manualSorting
			total={20}
			page={2}
			pageSize={5}
			onSortChange={(sort) => sort?.dir.toUpperCase()}
			onPageChange={(page) => page.toFixed()}
			error={<span>Unavailable</span>}
			onRetry={() => undefined}
		/>
	</ResourceList>
);
export const badResourceColumn: DataTableColumn<{ count: number }> = {
	id: "count",
	// @ts-expect-error Rich header content uses headerContent; header remains string-readable.
	header: <strong>Count</strong>,
	accessor: (row) => row.count,
};
// @ts-expect-error ResourceList preserves required data for existing callers reading the props type.
export const badResourceList = <ResourceList title="Missing rows" />;
// @ts-expect-error Battery meters always need an accessible name.
export const unnamedBattery = <BatteryMeter value={42} />;

import { FileDropzone, type FileRejection } from "@nocoo/basalt/components/file-dropzone";
import { FilterBar, FilterChip } from "@nocoo/basalt/components/filter-bar";
import { MultiSelect, type MultiSelectOption } from "@nocoo/basalt/components/multi-select";
import { type UploadFile, UploadItem, UploadQueue } from "@nocoo/basalt/components/upload-queue";

const selectableFolders = [
	{ value: "research", label: "Research" },
] as const satisfies readonly MultiSelectOption[];
const selectedFolders = ["research"] as const;
const _multiSelect = (
	<MultiSelect
		label="Folders"
		options={selectableFolders}
		value={selectedFolders}
		form="external-form"
		name="folders"
		query="research"
		onQueryChange={(query: string) => query.toLowerCase()}
		onValueChange={(value: string[]) => value.join(",")}
	/>
);
const _filterBar = (
	<FilterBar
		label="Filters"
		chips={<FilterChip label="Folder" value="Research" onRemove={() => {}} />}
	>
		<span>Search</span>
	</FilterBar>
);
const _dropzone = (
	<FileDropzone
		label="Files"
		onFilesAccepted={(files: File[]) => files.map((file) => file.name)}
		onFilesRejected={(rejections: FileRejection[]) => rejections.map((item) => item.code)}
	/>
);
const queuedFiles = [
	{ id: "a", name: "a.pdf", status: "uploading", progress: 50 },
] as const satisfies readonly UploadFile[];
const _uploadQueue = (
	<UploadQueue label="Uploads" files={queuedFiles} onCancel={(id: string) => id.toUpperCase()} />
);
const _uploadItem = <UploadItem file={queuedFiles[0]} onRetry={(id: string) => id.toUpperCase()} />;
// @ts-expect-error Selection is a list of stable string identifiers.
const _invalidSelection = <MultiSelect label="Folders" options={selectableFolders} value={[1]} />;
// @ts-expect-error Upload transport states are explicit; backend-specific states need an adapter.
const _invalidUpload = <UploadItem file={{ id: "a", name: "a.pdf", status: "processing" }} />;
// @ts-expect-error Accessible labeling is required for the file chooser.
const _unlabelledDropzone = <FileDropzone onFilesAccepted={() => {}} />;

import { EditableNavItem, FolderNavItem } from "@nocoo/basalt/components/editable-nav-item";
import { IconPicker, type IconPickerOption } from "@nocoo/basalt/components/icon-picker";
import {
	InlineEditable,
	type InlineEditableChangeReason,
} from "@nocoo/basalt/components/inline-editable";
import { ResponsiveMasterDetail } from "@nocoo/basalt/components/responsive-master-detail";
import {
	TAG_COLORS,
	TagBadge,
	type TagColor,
	tagColorFor,
} from "@nocoo/basalt/components/tag-badge";
import { TagColorPicker } from "@nocoo/basalt/components/tag-color-picker";

const compactIconOptions = [
	{ value: "folder", label: "Folder", icon: <span /> },
] as const satisfies readonly IconPickerOption[];
const _iconPicker = (
	<IconPicker
		label="Folder icon"
		options={compactIconOptions}
		value="folder"
		onValueChange={(value: string) => value.toUpperCase()}
	/>
);
const _inlineEditable = (
	<InlineEditable
		label="Title"
		value="Atlas"
		editing
		onSave={async (value: string) => {
			value.trim();
		}}
		onEditingChange={(_open: boolean, reason: InlineEditableChangeReason) => reason.toUpperCase()}
	/>
);
const _editableNav = (
	<EditableNavItem
		label="Atlas"
		href="/atlas"
		onRename={async (name: string) => {
			name.trim();
		}}
		actions={<button type="button">Pin</button>}
	/>
);
const _folderNav = <FolderNavItem label="Research" onSelect={() => {}} count={3} />;
const semanticColor: TagColor = tagColorFor("resource-id");
const _tag = (
	<TagBadge
		name={TAG_COLORS[semanticColor].label}
		colorKey="resource-id"
		color={semanticColor}
		title="Status"
		ref={createRef<HTMLSpanElement>()}
	/>
);
const _tagPicker = (
	<TagColorPicker
		label="Color"
		colors={["slate", "success"] as const}
		labels={{ success: "Healthy" }}
		onValueChange={(color: TagColor) => color.toUpperCase()}
	/>
);
const _masterDetail = (
	<ResponsiveMasterDetail
		label="Resources"
		list={<button type="button">Open</button>}
		detailOpen={false}
		onDetailOpenChange={(open: boolean) => {
			Boolean(open);
		}}
		selectedId={null}
	>
		<span>Details</span>
	</ResponsiveMasterDetail>
);
// @ts-expect-error The save adapter must resolve without a replacement value.
const _invalidSave = <InlineEditable label="Title" value="Atlas" onSave={async () => 1} />;
// @ts-expect-error Named colors are deliberate identifiers, not arbitrary unreviewed CSS values.
const _invalidTag = <TagBadge name="Tag" color="#777" />;
const _uncontrolledDetail = (
	// @ts-expect-error List/detail visibility is controlled by the application.
	<ResponsiveMasterDetail label="Resources" list={<span />}>
		Details
	</ResponsiveMasterDetail>
);
// @ts-expect-error Icon selection values use stable string identifiers.
const _invalidIconValue = <IconPicker label="Icon" options={compactIconOptions} value={42} />;
