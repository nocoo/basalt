import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
	CommandPaletteTrigger,
} from "@nocoo/basalt/components/command-palette";
import { MenuBarMenu, MenuBarRoot, MenuBarTrigger } from "@nocoo/basalt/components/menu-bar";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@nocoo/basalt/components/navigation-menu";
import { Pagination } from "@nocoo/basalt/components/pagination";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { Toolbar } from "@nocoo/basalt/components/toolbar";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import {
	type CatalogApiProp,
	type CatalogDocsDraft,
	provenanceFromLegacy,
} from "../../catalog-source";
import { SIDEBAR_EXAMPLES } from "../../examples/sidebar";
import { API as commandPaletteApi } from "../../generated/catalog-api/command-palette";
import { API as sidebarApi } from "../../generated/catalog-api/sidebar";
import { API as tabsApi } from "../../generated/catalog-api/tabs";
import { API as toolbarApi } from "../../generated/catalog-api/toolbar";

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
	return (
		<CommandPalette>
			<CommandPaletteTrigger asChild>
				<Button variant="outline">Search pages...</Button>
			</CommandPaletteTrigger>
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
	);
}

const commandPaletteDocs = extraDocs(
	"CommandPalette",
	"command-palette",
	"Search pages and commands.",
	"<CommandPalette><CommandInput placeholder='Search pages...' /><CommandList><CommandEmpty>No results</CommandEmpty><CommandGroup heading='Pages'><CommandItem>Button</CommandItem><CommandItem>Input</CommandItem></CommandGroup></CommandList></CommandPalette>",
	undefined,
	`import { Button } from "@nocoo/basalt/components/button";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
	CommandPaletteTrigger,
} from "@nocoo/basalt/components/command-palette";
import { useState } from "react";

export default function Example() {
	const [open, setOpen] = useState(false);
	return (
		<CommandPalette open={open} onOpenChange={setOpen}>
			<CommandPaletteTrigger asChild>
				<Button variant="outline">Search pages...</Button>
			</CommandPaletteTrigger>
			<CommandInput placeholder="Search pages..." />
			<CommandList>
				<CommandEmpty>No results</CommandEmpty>
				<CommandGroup heading="Pages">
					<CommandItem>Button</CommandItem>
					<CommandItem>Input</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandPalette>
	);
}`,
);

const tabsDocs = extraDocs(
	"Tabs",
	"tabs",
	"Tabbed navigation.",
	"<Tabs defaultValue='a'><TabsList><TabsTrigger value='a'>Home</TabsTrigger><TabsTrigger value='b'>About</TabsTrigger></TabsList></Tabs>",
	undefined,
	`import { Tabs, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";

export default function Example() {
	return (
		<Tabs defaultValue="a">
			<TabsList>
				<TabsTrigger value="a">Home</TabsTrigger>
				<TabsTrigger value="b">About</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}`,
);

const paginationDocs = extraDocs(
	"Pagination",
	"pagination",
	"Page controls.",
	"<Pagination page={page} pageCount={10} onPageChange={setPage} />",
	[
		{ name: "page", type: "number" },
		{ name: "pageCount", type: "number", default: "10" },
		{ name: "onPageChange", type: "(page: number) => void" },
		{
			name: "simple",
			type: "boolean",
			default: "false",
			description: "Previous and next only.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Disable every pagination control.",
		},
	],
	`import { Pagination } from "@nocoo/basalt/components/pagination";
import { useState } from "react";

export default function Example() {
	const [page, setPage] = useState(1);
	return <Pagination page={page} pageCount={10} onPageChange={setPage} />;
}`,
);

const breadcrumbsDocs = extraDocs(
	"Breadcrumbs",
	"breadcrumbs",
	"Hierarchical location.",
	'<Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />',
	undefined,
	`import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";

export default function Example() {
	return <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />;
}`,
);

const navigationMenuDocs = extraDocs(
	"NavigationMenu",
	"navigation-menu",
	"Site navigation.",
	"<NavigationMenu />",
);

const menuBarDocs = extraDocs("MenuBar", "menu-bar", "Desktop menu bar.", "<MenuBar />");

const toolbarDocs = extraDocs(
	"Toolbar",
	"toolbar",
	"Compose explicit toolbar controls into one grouped card.",
	'<Toolbar><Toolbar.Input aria-label="Search records" placeholder="Search..." /><Toolbar.Button icon={<Search />} aria-label="Search" /><Toolbar.Button icon={<Plus />} aria-label="Add" /></Toolbar>',
	undefined,
	`import { Toolbar } from "@nocoo/basalt/components/toolbar";
import { Plus, Search } from "lucide-react";

export default function Example() {
	return (
		<Toolbar>
			<Toolbar.Input aria-label="Search records" placeholder="Search..." />
			<Toolbar.Button icon={<Search />} aria-label="Search" />
			<Toolbar.Button icon={<Plus />} aria-label="Add" />
		</Toolbar>
	);
}`,
);

const tableOfContentsDocs = extraDocs(
	"TableOfContents",
	"table-of-contents",
	"On-this-page list.",
	"<TableOfContents><TableOfContentsItem active>Intro</TableOfContentsItem></TableOfContents>",
	undefined,
	`import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";

export default function Example() {
	return (
		<TableOfContents>
			<TableOfContentsItem active>Intro</TableOfContentsItem>
		</TableOfContents>
	);
}`,
);

const sidebarDocs = extraDocs(
	"Sidebar",
	"sidebar",
	"App chrome: L0 sidebar with an L1 content island that floats a corner shadow.",
	'(<div className="flex h-56 w-full overflow-hidden bg-basalt-background"><Sidebar className="h-full min-h-0 w-40"><SidebarItem active>Catalog</SidebarItem><SidebarItem>Settings</SidebarItem></Sidebar><div className="flex min-w-0 flex-1 flex-col p-2"><ContentIsland className="p-4">At a glance</ContentIsland></div></div>)',
	undefined,
	`import { ContentIsland, Sidebar, SidebarItem } from "@nocoo/basalt/components/sidebar";

export default function Example() {
	return (
		<div className="flex h-56 w-full overflow-hidden bg-basalt-background">
			<Sidebar className="h-full min-h-0 w-40">
				<SidebarItem active>Catalog</SidebarItem>
				<SidebarItem>Settings</SidebarItem>
			</Sidebar>
			<div className="flex min-w-0 flex-1 flex-col p-2">
				<ContentIsland className="p-4">At a glance</ContentIsland>
			</div>
		</div>
	);
}`,
);

export default catalogContentFamily({
	"command-palette": {
		docs: { ...commandPaletteDocs, api: commandPaletteApi },
		examples: [
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
  CommandPaletteTrigger,
} from "@nocoo/basalt/components/command-palette";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <CommandPalette open={open} onOpenChange={setOpen}>
      <CommandPaletteTrigger asChild>
        <Button variant="outline">Search pages...</Button>
      </CommandPaletteTrigger>
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem>Button</CommandItem>
          <CommandItem>Input</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandPalette>
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
  CommandPaletteTrigger,
} from "@nocoo/basalt/components/command-palette";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <CommandPalette open={open} onOpenChange={setOpen}>
      <CommandPaletteTrigger asChild>
        <Button variant="outline">Search pages...</Button>
      </CommandPaletteTrigger>
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandItem>Button</CommandItem>
        <CommandItem>Input</CommandItem>
      </CommandList>
    </CommandPalette>
  );
}`,
				render: () => <CommandPaletteExample flat />,
			},
		],
	},
	tabs: {
		docs: { ...tabsDocs, api: tabsApi },
		examples: [
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
	},
	pagination: {
		docs: paginationDocs,
		examples: [
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
	},
	breadcrumbs: {
		docs: breadcrumbsDocs,
		examples: [
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
	},
	"navigation-menu": {
		docs: navigationMenuDocs,
		examples: [
			{
				id: catalogScenarioId("navigation-menu", "default"),
				title: "Default",
				code: navigationMenuDocs.usage,
				render: () => (
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				),
			},
		],
	},
	"menu-bar": {
		docs: menuBarDocs,
		examples: [
			{
				id: catalogScenarioId("menu-bar", "default"),
				title: "Default",
				code: menuBarDocs.usage,
				render: () => (
					<MenuBarRoot>
						<MenuBarMenu>
							<MenuBarTrigger>File</MenuBarTrigger>
						</MenuBarMenu>
					</MenuBarRoot>
				),
			},
		],
	},
	toolbar: {
		docs: { ...toolbarDocs, api: toolbarApi },
		examples: [
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
	},
	"table-of-contents": {
		docs: tableOfContentsDocs,
		examples: [
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
	},
	sidebar: {
		docs: { ...sidebarDocs, api: sidebarApi },
		examples: SIDEBAR_EXAMPLES,
	},
});
