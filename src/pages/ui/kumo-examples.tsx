import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { Flow, FlowNode } from "@nocoo/basalt/components/flow";
import { Grid, GridItem } from "@nocoo/basalt/components/grid";
import { Pagination } from "@nocoo/basalt/components/pagination";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { Toolbar } from "@nocoo/basalt/components/toolbar";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { type CatalogScenario, catalogScenarioId } from "./catalog-scenario";

function PaginationExample({
	page: initialPage = 1,
	pageCount = 10,
	simple = false,
}: {
	page?: number;
	pageCount?: number;
	simple?: boolean;
}) {
	const [page, setPage] = useState(initialPage);
	return <Pagination page={page} pageCount={pageCount} onPageChange={setPage} simple={simple} />;
}

function CommandPaletteExample({ flat = false }: { flat?: boolean }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				Search pages...
			</Button>
			<CommandPalette open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search pages..." />
				<CommandList>
					<CommandEmpty>No results</CommandEmpty>
					{flat ? (
						<>
							<CommandItem>Button</CommandItem>
							<CommandItem>Input</CommandItem>
						</>
					) : (
						<CommandGroup heading="Pages">
							<CommandItem>Button</CommandItem>
							<CommandItem>Input</CommandItem>
						</CommandGroup>
					)}
				</CommandList>
			</CommandPalette>
		</>
	);
}

export const KUMO_EXAMPLES: Record<string, CatalogScenario[]> = {
	breadcrumbs: [
		{
			id: catalogScenarioId("breadcrumbs", "basic"),
			title: "Basic",
			code: '<Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />',
			render: () => <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />,
		},
		{
			id: catalogScenarioId("breadcrumbs", "loading"),
			title: "Loading",
			code: "<Breadcrumbs items={[{ label: <SkeletonLine minWidth={72} /> }]} />",
			render: () => <Breadcrumbs items={[{ label: <SkeletonLine minWidth={72} /> }]} />,
		},
	],
	pagination: [
		{
			id: catalogScenarioId("pagination", "full-controls-default"),
			title: "Full Controls (Default)",
			code: "const [page, setPage] = useState(1);\nreturn <Pagination page={page} pageCount={10} onPageChange={setPage} />;",
			render: () => <PaginationExample page={1} pageCount={10} />,
		},
		{
			id: catalogScenarioId("pagination", "simple-controls"),
			title: "Simple Controls",
			code: "const [page, setPage] = useState(2);\nreturn <Pagination page={page} pageCount={10} simple onPageChange={setPage} />;",
			render: () => <PaginationExample page={2} pageCount={10} simple />,
		},
		{
			id: catalogScenarioId("pagination", "mid-page-state"),
			title: "Mid-Page State",
			code: "const [page, setPage] = useState(5);\nreturn <Pagination page={page} pageCount={12} onPageChange={setPage} />;",
			render: () => <PaginationExample page={5} pageCount={12} />,
		},
	],
	tabs: [
		{
			id: catalogScenarioId("tabs", "variants"),
			title: "Variants",
			code: `<Tabs defaultValue="a">
  <TabsList>
    <TabsTrigger value="a">Home</TabsTrigger>
    <TabsTrigger value="b">About</TabsTrigger>
  </TabsList>
  <TabsContent value="a">Home overview and getting started.</TabsContent>
  <TabsContent value="b">About this project and its goals.</TabsContent>
</Tabs>`,
			render: () => (
				<Tabs defaultValue="a">
					<TabsList>
						<TabsTrigger value="a">Home</TabsTrigger>
						<TabsTrigger value="b">About</TabsTrigger>
					</TabsList>
					<TabsContent value="a">Home overview and getting started.</TabsContent>
					<TabsContent value="b">About this project and its goals.</TabsContent>
				</Tabs>
			),
		},
		{
			id: catalogScenarioId("tabs", "many-tabs"),
			title: "Many Tabs",
			code: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="usage">Usage</TabsTrigger>
    <TabsTrigger value="api">API</TabsTrigger>
    <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
    <TabsTrigger value="changelog">Changelog</TabsTrigger>
  </TabsList>
</Tabs>`,
			render: () => (
				<Tabs defaultValue="overview">
					<TabsList>
						{["Overview", "Usage", "API", "Accessibility", "Changelog"].map((label) => (
							<TabsTrigger key={label} value={label.toLowerCase()}>
								{label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			),
		},
	],
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
	"table-of-contents": [
		{
			id: catalogScenarioId("table-of-contents", "options"),
			title: "Options",
			code: `<TableOfContents>
  <TableOfContentsItem active>Intro</TableOfContentsItem>
  <TableOfContentsItem>Usage</TableOfContentsItem>
</TableOfContents>`,
			render: () => (
				<TableOfContents>
					<TableOfContentsItem active>Intro</TableOfContentsItem>
					<TableOfContentsItem>Usage</TableOfContentsItem>
				</TableOfContents>
			),
		},
		{
			id: catalogScenarioId("table-of-contents", "no-active-item"),
			title: "No active item",
			code: `<TableOfContents>
  <TableOfContentsItem>Intro</TableOfContentsItem>
  <TableOfContentsItem>Usage</TableOfContentsItem>
</TableOfContents>`,
			render: () => (
				<TableOfContents>
					<TableOfContentsItem>Intro</TableOfContentsItem>
					<TableOfContentsItem>Usage</TableOfContentsItem>
				</TableOfContents>
			),
		},
		{
			id: catalogScenarioId("table-of-contents", "without-title"),
			title: "Without title",
			code: `<TableOfContents title="">
  <TableOfContentsItem active>Intro</TableOfContentsItem>
</TableOfContents>`,
			render: () => (
				<TableOfContents title="">
					<TableOfContentsItem active>Intro</TableOfContentsItem>
				</TableOfContents>
			),
		},
	],
	toolbar: [
		{
			id: catalogScenarioId("toolbar", "input-shorthand"),
			title: "Input Shorthand",
			code: '<Toolbar><Toolbar.Input aria-label="Search records" placeholder="Search..." /><Toolbar.Button icon={<Search />} aria-label="Search" /><Toolbar.Button icon={<Plus />} aria-label="Add" /></Toolbar>',
			render: () => (
				<Toolbar className="w-full max-w-md">
					<Toolbar.Input aria-label="Search records" placeholder="Search..." className="flex-1" />
					<Toolbar.Button icon={<Search />} aria-label="Search" />
					<Toolbar.Button icon={<Plus />} aria-label="Add" />
				</Toolbar>
			),
		},
		{
			id: catalogScenarioId("toolbar", "button-actions"),
			title: "Button Actions",
			code: "<Toolbar><Toolbar.Button>Upload</Toolbar.Button><Toolbar.Button>Download</Toolbar.Button></Toolbar>",
			render: () => (
				<Toolbar>
					<Toolbar.Button>Upload</Toolbar.Button>
					<Toolbar.Button>Download</Toolbar.Button>
				</Toolbar>
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
	"command-palette": [
		{
			id: catalogScenarioId("command-palette", "with-grouped-items"),
			title: "With Grouped Items",
			code: `import { Button } from "@nocoo/basalt/components/button";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Search pages...</Button>
      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem>Button</CommandItem>
            <CommandItem>Input</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandPalette>
    </>
  );
}`,
			render: () => <CommandPaletteExample />,
		},
		{
			id: catalogScenarioId("command-palette", "simple-flat-list"),
			title: "Simple Flat List",
			code: `import { Button } from "@nocoo/basalt/components/button";
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Search pages...</Button>
      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandItem>Button</CommandItem>
          <CommandItem>Input</CommandItem>
        </CommandList>
      </CommandPalette>
    </>
  );
}`,
			render: () => <CommandPaletteExample flat />,
		},
	],
};
