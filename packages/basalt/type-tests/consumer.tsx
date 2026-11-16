import { Button, Field, Text, ThemeProvider } from "@nocoo/basalt";
import { BatteryMeter } from "@nocoo/basalt/components/battery-meter";
import { Button as GranularButton } from "@nocoo/basalt/components/button";
import {
	ChartFrame,
	ChartLegend,
	type ChartSeriesDescriptor,
} from "@nocoo/basalt/components/chart";
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { Field as GranularField } from "@nocoo/basalt/components/field";
import { ResourceList } from "@nocoo/basalt/components/resource-list";
import { StatCard } from "@nocoo/basalt/components/stat-card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	TableSortableHeader,
	type TableTextAlign,
} from "@nocoo/basalt/components/table";
import { Text as GranularText } from "@nocoo/basalt/components/text";
import { Search } from "@nocoo/basalt/icons";
import * as DialogPrimitive from "@nocoo/basalt/primitives/dialog";
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
	DatePicker,
	DataTable,
	Search,
	DialogPrimitive,
};

const chartSeries: ChartSeriesDescriptor[] = [{ key: "y", label: "Requests" }];
const _chartFrame = (
	<ChartFrame ariaLabel="Requests" summary="Requests rose.">
		<ChartLegend items={chartSeries} />
	</ChartFrame>
);
const _statCard = <StatCard value={12} icon={<Search />} subtitle="Requests" />;

// Resource composition retains readable legacy columns and infers row callbacks.
const resourceColumns: DataTableColumn<{ id: string; count: bigint }>[] = [
	{
		id: "count",
		header: "Count",
		accessor: (row) => row.count,
		sortValue: (row) => row.count,
		headerContent: <strong>Count</strong>,
		textAlign: "end",
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
			edge="attached"
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

const numericAlignment: TableTextAlign = "end";
export const logicalRecordTable = (
	<Table dir="rtl">
		<TableHeader>
			<TableRow>
				<TableHead textAlign={numericAlignment} aria-sort="ascending">
					<TableSortableHeader
						ref={createRef<HTMLButtonElement>()}
						textAlign={numericAlignment}
						sorted="asc"
						onClick={(event) => event.currentTarget.focus()}
					>
						Count
					</TableSortableHeader>
				</TableHead>
				<TableHead align="right" colSpan={1}>
					Native alignment
				</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			<TableRow>
				<TableCell textAlign="end">12</TableCell>
				<TableCell align="center" rowSpan={1}>
					Native attributes
				</TableCell>
			</TableRow>
		</TableBody>
	</Table>
);
// @ts-expect-error Semantic alignment uses logical directions, not native HTML values.
const _invalidTableAlignment = <TableCell textAlign="right" />;
// @ts-expect-error Sort direction uses the shared short identifiers.
const _invalidTableDirection = <TableSortableHeader sorted="descending">Count</TableSortableHeader>;
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
