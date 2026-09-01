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
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import {
	type CatalogApiProp,
	type CatalogDocsDraft,
	provenanceFromLegacy,
} from "../../catalog-source";

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

const PAGE_HEADER_USAGE = `import { PageHeader } from "@nocoo/basalt/components/page-header";

export default function Example() {
	return <AppHeader breadcrumbs={[{ href: "/", label: "Examples" }]} title="Dashboard" />;
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
		docs: extraDocs(
			"Table",
			"table",
			"Tabular data with a header bar and striped rows.",
			"<Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Report 1</TableCell><TableCell>Active</TableCell></TableRow></TableBody></Table>",
			undefined,
			TABLE_USAGE,
		),
		examples: [
			{
				id: catalogScenarioId("table", "basic"),
				title: "Basic",
				code: `<Table>
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
</Table>`,
				render: () => (
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
			},
			{
				id: catalogScenarioId("table", "selected-row"),
				title: "Selected Row",
				code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow variant="selected">
      <TableCell>Selected</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Idle</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
				render: () => (
					<Table className="w-[200px]">
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow variant="selected">
								<TableCell>Selected</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Idle</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				),
			},
		],
	},
	"data-table": {
		docs: extraDocs(
			"DataTable",
			"data-table",
			"Sortable data table.",
			'<DataTable data={[{ name: "Atlas" }]} columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]} />',
			[
				{ name: "data", type: "T[]" },
				{ name: "columns", type: "DataTableColumn<T>[]" },
				{ name: "filter", type: "string" },
			],
			DATA_TABLE_USAGE,
		),
		examples: [
			{
				id: catalogScenarioId("data-table", "default"),
				title: "Default",
				code: DATA_TABLE_USAGE,
				render: () => (
					<DataTable
						data={[{ name: "Atlas" }]}
						columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
					/>
				),
			},
		],
	},
	grid: {
		docs: extraDocs(
			"Grid",
			"grid",
			"Simple grid.",
			"<Grid><GridItem>1</GridItem><GridItem>2</GridItem><GridItem>3</GridItem><GridItem>4</GridItem></Grid>",
			undefined,
			GRID_USAGE,
		),
		examples: [
			{
				id: catalogScenarioId("grid", "grid"),
				title: "Grid",
				code: `<Grid className="w-full max-w-sm">
  <GridItem>1</GridItem>
  <GridItem>2</GridItem>
  <GridItem>3</GridItem>
  <GridItem>4</GridItem>
</Grid>`,
				render: () => (
					<Grid className="w-full max-w-sm">
						<GridItem>1</GridItem>
						<GridItem>2</GridItem>
						<GridItem>3</GridItem>
						<GridItem>4</GridItem>
					</Grid>
				),
			},
		],
	},
	flow: {
		docs: extraDocs(
			"Flow",
			"flow",
			"Step flow.",
			"<Flow><FlowNode>Step 1</FlowNode><FlowNode>Step 2</FlowNode></Flow>",
			undefined,
			FLOW_USAGE,
		),
		examples: [
			{
				id: catalogScenarioId("flow", "sequential-flow"),
				title: "Sequential Flow",
				code: "<Flow><FlowNode>Step 1</FlowNode><FlowNode>Step 2</FlowNode></Flow>",
				render: () => (
					<Flow>
						<FlowNode>Step 1</FlowNode>
						<FlowNode>Step 2</FlowNode>
					</Flow>
				),
			},
		],
	},
	"page-header": {
		docs: extraDocs(
			"PageHeader",
			"page-header",
			"App header with breadcrumbs and title.",
			'<AppHeader breadcrumbs={[{ href: "/", label: "Examples" }]} title="Dashboard" />',
			undefined,
			PAGE_HEADER_USAGE,
		),
		examples: [
			{
				id: catalogScenarioId("page-header", "default"),
				title: "Default",
				code: PAGE_HEADER_USAGE,
				render: () => (
					<AppHeader
						breadcrumbs={[{ href: "#", label: "Examples" }]}
						title="Dashboard"
						actions={<Button variant="ghost">Action</Button>}
					/>
				),
			},
		],
	},
});
