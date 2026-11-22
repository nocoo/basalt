import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandItemMeta,
	CommandItemTrailing,
	CommandList,
	CommandPalette,
	CommandPaletteTrigger,
} from "@nocoo/basalt/components/command-palette";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";
import { Pagination } from "@nocoo/basalt/components/pagination";
import { Skeleton } from "@nocoo/basalt/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { Toolbar } from "@nocoo/basalt/components/toolbar";
import {
	ChevronDown,
	CircleDot,
	Folder,
	LayoutGrid,
	ListFilter,
	Plus,
	Search,
} from "@nocoo/basalt/icons";
import { useState } from "react";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import {
	type CatalogApiProp,
	type CatalogDocsDraft,
	provenanceFromLegacy,
} from "../../catalog-source";
import { EDITABLE_NAV_ITEM_EXAMPLES } from "../../examples/editable-nav-item";
import { SIDEBAR_EXAMPLES } from "../../examples/sidebar";
import { TABLE_OF_CONTENTS_EXAMPLES } from "../../examples/table-of-contents";
import { API as breadcrumbsApi } from "../../generated/catalog-api/breadcrumbs";
import { API as commandPaletteApi } from "../../generated/catalog-api/command-palette";
import { API as editableNavItemApi } from "../../generated/catalog-api/editable-nav-item";
import { API as paginationApi } from "../../generated/catalog-api/pagination";
import { API as sidebarApi } from "../../generated/catalog-api/sidebar";
import { API as tableOfContentsApi } from "../../generated/catalog-api/table-of-contents";
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

function scenarioModule(code: string, imports: string[]): string {
	const importLines = imports.join("\n");
	return `${importLines}\n\nexport default function Example() {\n\treturn (\n\t\t${code.split("\n").join("\n\t\t")}\n\t);\n}`;
}

const CONVERSATION_ITEMS = [
	{ title: "Sys2: 工作流编制", workspace: "system", time: "now", status: "active" as const },
	{
		title: "Pull And Run Code Locally",
		workspace: "signoff.now",
		time: "now",
		status: "grid" as const,
	},
	{ title: "Check Gmail Access", workspace: "research", time: "21m", status: null },
	{ title: "Git Pull And Update Certs", workspace: "workflow", time: "24m", status: null },
	{ title: "Antigravity SDK", workspace: "research", time: "2h", status: null },
];

function CommandPaletteExample({ flat = false }: { flat?: boolean }) {
	const [scope, setScope] = useState("Conversations");
	if (!flat) {
		return (
			<CommandPalette>
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
	}
	return (
		<CommandPalette className="sm:w-[38rem]">
			<CommandPaletteTrigger asChild>
				<Button variant="outline">Search conversations...</Button>
			</CommandPaletteTrigger>
			<CommandInput
				placeholder={`Search for ${scope.toLowerCase()}...`}
				leading={
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="secondary" size="sm" className="gap-basalt-space-sm">
								<span>{scope}</span>
								<ChevronDown className="size-basalt-icon-sm text-basalt-muted-foreground" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							{["Conversations", "Files", "Commands"].map((option) => (
								<DropdownMenuItem key={option} onSelect={() => setScope(option)}>
									{option}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				}
				trailing={
					<Button variant="ghost" size="icon-sm" aria-label="Filter results">
						<ListFilter className="size-basalt-icon text-basalt-muted-foreground" />
					</Button>
				}
			/>
			<CommandList>
				<CommandEmpty>No results</CommandEmpty>
				{CONVERSATION_ITEMS.map((item) => (
					<CommandItem key={item.title} value={`${item.title} ${item.workspace}`}>
						<span className="truncate font-medium">{item.title}</span>
						<CommandItemMeta>
							<Folder className="size-basalt-icon-sm shrink-0" aria-hidden="true" />
							<span>{item.workspace}</span>
						</CommandItemMeta>
						<CommandItemTrailing>
							{item.status === "active" ? (
								<CircleDot className="size-basalt-icon-sm text-basalt-link" aria-hidden="true" />
							) : item.status === "grid" ? (
								<LayoutGrid
									className="size-basalt-icon-sm text-basalt-muted-foreground"
									aria-hidden="true"
								/>
							) : null}
							<span>{item.time}</span>
						</CommandItemTrailing>
					</CommandItem>
				))}
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
	`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";

export default function Example() {
	return (
		<Tabs defaultValue="a">
			<TabsList>
				<TabsTrigger value="a">Home</TabsTrigger>
				<TabsTrigger value="b">About</TabsTrigger>
			</TabsList>
			<TabsContent value="a">Home overview and getting started.</TabsContent>
			<TabsContent value="b">About this care plan and its goals.</TabsContent>
		</Tabs>
	);
}`,
);

const breadcrumbsDocs: CatalogDocsDraft = {
	description: "Hierarchical location.",
	usage: `import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";

export default function Example() {
	return <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />;
}`,
	variants: [],
	api: breadcrumbsApi,
	provenance: EXTRA_PROVENANCE,
};

const toolbarDocs = extraDocs(
	"Toolbar",
	"toolbar",
	"Compose explicit toolbar controls into one grouped card. ToolbarButton and ToolbarInput are aliases of Toolbar.Button and Toolbar.Input respectively, sharing the same implementation and props interfaces.",
	'<Toolbar><Toolbar.Input aria-label="Search records" placeholder="Search..." /><Toolbar.Button icon={<Search />} aria-label="Search" /><Toolbar.Button icon={<Plus />} aria-label="Add" /></Toolbar>',
	undefined,
	`import { Toolbar } from "@nocoo/basalt/components/toolbar";
import { Plus, Search } from "@nocoo/basalt/icons";

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
	"App chrome: L0 sidebar with an L1 content island that floats a corner shadow. SidebarSearch is a native button supporting button attributes; inside a provider it becomes an accessible icon item with a tooltip while collapsed, so consumers keep one instance. Its shortcut is a visual label only and does not register keyboard shortcuts (defaults to ⌘K). SidebarIconItem requires caller-provided aria-label or aria-labelledby for accessible naming. SidebarGroup provides an uncontrolled collapsible section with defaultOpen and does not accept controlled open props or arbitrary DOM attributes. SidebarProvider.defaultWidth accepts an initial width clamped between 180px and 400px. useSidebar() must be called inside a SidebarProvider (throws an error if called outside) and returns the sidebar context state rather than component props.",
	"",
	undefined,
	SIDEBAR_EXAMPLES[0].code,
);

export default catalogContentFamily({
	"editable-nav-item": {
		docs: {
			description:
				"EditableNavItem and EditableNavItem compose navigation, inline rename, caller icons and independent trailing actions. Links use LinkProvider; selection, care plan entities, permissions and persistence belong to the application.",
			usage: EDITABLE_NAV_ITEM_EXAMPLES[0].code,
			variants: [],
			api: editableNavItemApi,
			provenance: provenanceFromLegacy({ repo: "zhe", sha: "075c875936e9", file: "components" }),
		},
		examples: EDITABLE_NAV_ITEM_EXAMPLES,
	},
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
				title: "Scoped Search List",
				code: `import { Button } from "@nocoo/basalt/components/button";
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandItemMeta,
  CommandItemTrailing,
  CommandList,
  CommandPalette,
  CommandPaletteTrigger,
} from "@nocoo/basalt/components/command-palette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";
import { ChevronDown, CircleDot, Folder, LayoutGrid, ListFilter } from "@nocoo/basalt/icons";
import { useState } from "react";

const CONVERSATION_ITEMS = [
  { title: "Sys2: 工作流编制", workspace: "system", time: "now", status: "active" as const },
  { title: "Pull And Run Code Locally", workspace: "signoff.now", time: "now", status: "grid" as const },
  { title: "Check Gmail Access", workspace: "research", time: "21m", status: null },
];

export default function Example() {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState("Conversations");
  return (
    <CommandPalette open={open} onOpenChange={setOpen} className="sm:w-[38rem]">
      <CommandPaletteTrigger asChild>
        <Button variant="outline">Search conversations...</Button>
      </CommandPaletteTrigger>
      <CommandInput
        placeholder={\`Search for \${scope.toLowerCase()}...\`}
        leading={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-basalt-space-sm">
                <span>{scope}</span>
                <ChevronDown className="size-basalt-icon-sm text-basalt-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {["Conversations", "Files", "Commands"].map((option) => (
                <DropdownMenuItem key={option} onSelect={() => setScope(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
        trailing={
          <Button variant="ghost" size="icon-sm" aria-label="Filter results">
            <ListFilter className="size-basalt-icon text-basalt-muted-foreground" />
          </Button>
        }
      />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        {CONVERSATION_ITEMS.map((item) => (
          <CommandItem key={item.title} value={\`\${item.title} \${item.workspace}\`}>
            <span className="truncate font-medium">{item.title}</span>
            <CommandItemMeta>
              <Folder className="size-basalt-icon-sm shrink-0" aria-hidden="true" />
              <span>{item.workspace}</span>
            </CommandItemMeta>
            <CommandItemTrailing>
              {item.status === "active" ? (
                <CircleDot className="size-basalt-icon-sm text-basalt-link" aria-hidden="true" />
              ) : item.status === "grid" ? (
                <LayoutGrid className="size-basalt-icon-sm text-basalt-muted-foreground" aria-hidden="true" />
              ) : null}
              <span>{item.time}</span>
            </CommandItemTrailing>
          </CommandItem>
        ))}
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
				code: scenarioModule(
					`<Tabs defaultValue="a">
	<TabsList>
		<TabsTrigger value="a">Home</TabsTrigger>
		<TabsTrigger value="b">About</TabsTrigger>
	</TabsList>
	<TabsContent value="a">Home overview and getting started.</TabsContent>
	<TabsContent value="b">About this care plan and its goals.</TabsContent>
</Tabs>`,
					[
						'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";',
					],
				),
				render: () => (
					<Tabs defaultValue="a">
						<TabsList>
							<TabsTrigger value="a">Home</TabsTrigger>
							<TabsTrigger value="b">About</TabsTrigger>
						</TabsList>
						<TabsContent value="a">Home overview and getting started.</TabsContent>
						<TabsContent value="b">About this care plan and its goals.</TabsContent>
					</Tabs>
				),
			},
			{
				id: catalogScenarioId("tabs", "many-tabs"),
				title: "Many Tabs",
				code: scenarioModule(
					`<Tabs defaultValue="overview">
	<TabsList>
		{["Overview", "Usage", "API", "Accessibility", "Changelog"].map((label) => (
			<TabsTrigger key={label} value={label.toLowerCase()}>
				{label}
			</TabsTrigger>
		))}
	</TabsList>
	<TabsContent value="overview">Overview of the control.</TabsContent>
	<TabsContent value="usage">How to use the control.</TabsContent>
	<TabsContent value="api">Public API.</TabsContent>
	<TabsContent value="accessibility">Keyboard and labels.</TabsContent>
	<TabsContent value="changelog">Recent changes.</TabsContent>
</Tabs>`,
					[
						'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";',
					],
				),
				render: () => (
					<Tabs defaultValue="overview">
						<TabsList>
							{["Overview", "Usage", "API", "Accessibility", "Changelog"].map((label) => (
								<TabsTrigger key={label} value={label.toLowerCase()}>
									{label}
								</TabsTrigger>
							))}
						</TabsList>
						<TabsContent value="overview">Overview of the control.</TabsContent>
						<TabsContent value="usage">How to use the control.</TabsContent>
						<TabsContent value="api">Public API.</TabsContent>
						<TabsContent value="accessibility">Keyboard and labels.</TabsContent>
						<TabsContent value="changelog">Recent changes.</TabsContent>
					</Tabs>
				),
			},
		],
	},
	breadcrumbs: {
		docs: breadcrumbsDocs,
		examples: [
			{
				id: catalogScenarioId("breadcrumbs", "basic"),
				title: "Basic",
				code: scenarioModule(
					'<Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />',
					['import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";'],
				),
				render: () => <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />,
			},
			{
				id: catalogScenarioId("breadcrumbs", "loading"),
				title: "Loading",
				code: scenarioModule("<Breadcrumbs items={[{ label: <Skeleton width={72} /> }]} />", [
					'import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";',
					'import { Skeleton } from "@nocoo/basalt/components/skeleton";',
				]),
				render: () => <Breadcrumbs items={[{ label: <Skeleton width={72} /> }]} />,
			},
		],
	},
	toolbar: {
		docs: { ...toolbarDocs, api: toolbarApi },
		examples: [
			{
				id: catalogScenarioId("toolbar", "input-shorthand"),
				title: "Input Shorthand",
				code: scenarioModule(
					`<Toolbar className="w-full max-w-md">
	<Toolbar.Input aria-label="Search records" placeholder="Search..." className="flex-1" />
	<Toolbar.Button icon={<Search />} aria-label="Search" />
	<Toolbar.Button icon={<Plus />} aria-label="Add" />
</Toolbar>`,
					[
						'import { Toolbar } from "@nocoo/basalt/components/toolbar";',
						'import { Plus, Search } from "@nocoo/basalt/icons";',
					],
				),
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
				code: scenarioModule(
					`<Toolbar>
	<Toolbar.Button>Upload</Toolbar.Button>
	<Toolbar.Button>Download</Toolbar.Button>
</Toolbar>`,
					['import { Toolbar } from "@nocoo/basalt/components/toolbar";'],
				),
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
		docs: { ...tableOfContentsDocs, api: tableOfContentsApi },
		examples: TABLE_OF_CONTENTS_EXAMPLES,
	},
	sidebar: {
		docs: { ...sidebarDocs, api: sidebarApi },
		examples: SIDEBAR_EXAMPLES,
	},
	pagination: {
		docs: {
			description: "Segmented page navigator supporting compact, simple, and numbered page modes.",
			usage: scenarioModule("<Pagination defaultPage={2} pageCount={10} />", [
				'import { Pagination } from "@nocoo/basalt/components/pagination";',
			]),
			variants: ["default", "numbered", "simple"],
			api: paginationApi,
		},
		examples: [
			{
				id: catalogScenarioId("pagination", "default"),
				title: "Compact navigator",
				code: scenarioModule("<Pagination defaultPage={2} pageCount={10} />", [
					'import { Pagination } from "@nocoo/basalt/components/pagination";',
				]),
				render: () => <Pagination defaultPage={2} pageCount={10} />,
			},
			{
				id: catalogScenarioId("pagination", "numbered"),
				title: "Numbered pages",
				code: scenarioModule("<Pagination defaultPage={5} pageCount={12} showPageNumbers />", [
					'import { Pagination } from "@nocoo/basalt/components/pagination";',
				]),
				render: () => <Pagination defaultPage={5} pageCount={12} showPageNumbers />,
			},
			{
				id: catalogScenarioId("pagination", "simple"),
				title: "Simple previous and next",
				code: scenarioModule("<Pagination defaultPage={3} pageCount={10} simple />", [
					'import { Pagination } from "@nocoo/basalt/components/pagination";',
				]),
				render: () => <Pagination defaultPage={3} pageCount={10} simple />,
			},
		],
	},
});
