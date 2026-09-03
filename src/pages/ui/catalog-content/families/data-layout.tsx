import { catalogContentFamily } from "../../catalog-content";
import {
	type CatalogApiProp,
	type CatalogDocsDraft,
	provenanceFromLegacy,
} from "../../catalog-source";
import { DATA_TABLE_EXAMPLES } from "../../examples/data-table";
import { DELETE_RESOURCE_EXAMPLES } from "../../examples/delete-resource";
import { DESCRIPTION_LIST_EXAMPLES } from "../../examples/description-list";
import { FLOW_EXAMPLES } from "../../examples/flow";
import { GRID_EXAMPLES } from "../../examples/grid";
import { PAGE_HEADER_EXAMPLES } from "../../examples/page-header";
import { RESOURCE_LIST_EXAMPLES } from "../../examples/resource-list";
import { STAT_STRIP_EXAMPLES } from "../../examples/stat-strip";
import { TABLE_EXAMPLES } from "../../examples/table";
import { TABLE_PAGER_EXAMPLES } from "../../examples/table-pager";
import { API as dataTableApi } from "../../generated/catalog-api/data-table";
import { API as deleteResourceApi } from "../../generated/catalog-api/delete-resource";
import { API as descriptionListApi } from "../../generated/catalog-api/description-list";
import { API as flowApi } from "../../generated/catalog-api/flow";
import { API as gridApi } from "../../generated/catalog-api/grid";
import { API as pageHeaderApi } from "../../generated/catalog-api/page-header";
import { API as resourceListApi } from "../../generated/catalog-api/resource-list";
import { API as statStripApi } from "../../generated/catalog-api/stat-strip";
import { API as tableApi } from "../../generated/catalog-api/table";
import { API as tablePagerApi } from "../../generated/catalog-api/table-pager";

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
	props: CatalogApiProp[] = [{ name: "className", type: "string" }],
	usage?: string,
): CatalogDocsDraft {
	return {
		description,
		usage:
			usage ??
			`import { ${name} } from "@nocoo/basalt/components/${slug}";\n\nexport default function Example() {\n\treturn ${sample};\n}`,
		variants: [],
		api: [
			{
				name,
				props: props.map((prop) => ({
					...prop,
					description: prop.description ?? prop.name,
				})),
			},
		],
		provenance: EXTRA_PROVENANCE,
	};
}

const TABLE_USAGE = `import {
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
}`;

const DATA_TABLE_USAGE = `import { DataTable } from "@nocoo/basalt/components/data-table";

export default function Example() {
	return <DataTable data={[{ name: "Atlas" }]} columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]} />;
}`;

const GRID_USAGE = `import { Grid, GridItem } from "@nocoo/basalt/components/grid";

export default function Example() {
	return (
		<Grid>
			<GridItem>1</GridItem>
			<GridItem>2</GridItem>
			<GridItem>3</GridItem>
			<GridItem>4</GridItem>
		</Grid>
	);
}`;

const FLOW_USAGE = `import { Flow, FlowNode } from "@nocoo/basalt/components/flow";

export default function Example() {
	return (
		<Flow>
			<FlowNode>Step 1</FlowNode>
			<FlowNode>Step 2</FlowNode>
		</Flow>
	);
}`;

export default catalogContentFamily({
	table: {
		docs: {
			...extraDocs(
				"Table",
				"table",
				"Tabular data with a header bar and striped rows.",
				"<Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Report 1</TableCell><TableCell>Active</TableCell></TableRow></TableBody></Table>",
				undefined,
				TABLE_USAGE,
			),
			api: tableApi,
		},
		examples: TABLE_EXAMPLES,
	},
	"description-list": {
		docs: {
			...extraDocs(
				"DescriptionList",
				"description-list",
				"Stacked term and value pairs. Not a painted surface.",
				'<DescriptionList><DescriptionList.Item term="Status">Active</DescriptionList.Item></DescriptionList>',
				undefined,
				`import { DescriptionList } from "@nocoo/basalt/components/description-list";

export default function Example() {
	return (
		<DescriptionList>
			<DescriptionList.Item term="Status">Active</DescriptionList.Item>
			<DescriptionList.Item term="Plan">Enterprise</DescriptionList.Item>
		</DescriptionList>
	);
}`,
			),
			api: descriptionListApi,
		},
		examples: DESCRIPTION_LIST_EXAMPLES,
	},
	"data-table": {
		docs: {
			...extraDocs(
				"DataTable",
				"data-table",
				"Sortable data table.",
				'<DataTable data={[{ name: "Atlas" }]} columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]} />',
				undefined,
				DATA_TABLE_USAGE,
			),
			api: dataTableApi,
		},
		examples: DATA_TABLE_EXAMPLES,
	},
	grid: {
		docs: {
			...extraDocs(
				"Grid",
				"grid",
				"Simple grid.",
				"<Grid><GridItem>1</GridItem><GridItem>2</GridItem><GridItem>3</GridItem><GridItem>4</GridItem></Grid>",
				undefined,
				GRID_USAGE,
			),
			api: gridApi,
		},
		examples: GRID_EXAMPLES,
	},
	flow: {
		docs: {
			...extraDocs(
				"Flow",
				"flow",
				"Step flow.",
				"<Flow><FlowNode>Step 1</FlowNode><FlowNode>Step 2</FlowNode></Flow>",
				undefined,
				FLOW_USAGE,
			),
			api: flowApi,
		},
		examples: FLOW_EXAMPLES,
	},
	"page-header": {
		docs: {
			description:
				"A flush content page heading with optional description, actions, and a separate filters row.",
			usage: `import { PageHeader } from "@nocoo/basalt/components/page-header";

export default function Example() {
	return <PageHeader title="Dashboard" description="Overview of recent project activity." />;
}`,
			variants: [],
			api: pageHeaderApi,
			provenance: EXTRA_PROVENANCE,
		},
		examples: PAGE_HEADER_EXAMPLES,
	},
	"stat-strip": {
		docs: {
			description:
				"A responsive definition list of labelled values for page or dashboard overviews.",
			usage: `import { StatStrip } from "@nocoo/basalt/components/stat-strip";

export default function Example() {
	return <StatStrip items={[{ label: "Projects", value: "24" }]} />;
}`,
			variants: [],
			api: statStripApi,
			provenance: provenanceFromLegacy({
				repo: "ai-arsenal",
				sha: "78114d43df59",
				file: "src/components/ui/page-header.tsx",
			}),
		},
		examples: STAT_STRIP_EXAMPLES,
	},
	"table-pager": {
		docs: {
			description: "A table footer that pairs a result range with page controls.",
			usage: `import { TablePager } from "@nocoo/basalt/components/table-pager";

export default function Example() {
	return <TablePager page={page} pageSize={10} totalCount={47} onPageChange={setPage} />;
}`,
			variants: [],
			api: tablePagerApi,
			provenance: provenanceFromLegacy({
				repo: "pika",
				sha: "d9b12caf26a4",
				file: "packages/web/src/components/ui/data-table-pagination.tsx",
			}),
		},
		examples: TABLE_PAGER_EXAMPLES,
	},
	"resource-list": {
		docs: {
			...extraDocs(
				"ResourceList",
				"resource-list",
				"A page heading and table of named resources.",
				'<ResourceList title="Projects" data={[{ name: "Atlas", status: "Active" }]} />',
			),
			api: resourceListApi,
		},
		examples: RESOURCE_LIST_EXAMPLES,
	},
	"delete-resource": {
		docs: {
			...extraDocs(
				"DeleteResource",
				"delete-resource",
				"A confirmation dialog that deletes a named resource.",
				'<DeleteResource name="Atlas" onDelete={() => undefined} />',
			),
			api: deleteResourceApi,
		},
		examples: DELETE_RESOURCE_EXAMPLES,
	},
});
