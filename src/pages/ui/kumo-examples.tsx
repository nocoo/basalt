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
import { type CatalogScenario, catalogScenarioId } from "./catalog-scenario";

export const KUMO_EXAMPLES: Record<string, CatalogScenario[]> = {
	table: [
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
	grid: [
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
	flow: [
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
};
