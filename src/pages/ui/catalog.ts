export type CatalogKind = "stable" | "catalog" | "chart" | "provider";

export type CatalogCategory = "docs" | "component" | "chart" | "block";

export interface CatalogEntry {
	slug: string;
	name: string;
	kind: CatalogKind;
	category: CatalogCategory;
	navName?: string;
}

export const CATALOG_CATEGORIES: { id: CatalogCategory; label: string }[] = [
	{ id: "component", label: "Components" },
	{ id: "chart", label: "Charts" },
	{ id: "block", label: "Blocks" },
];

export const CATALOG: CatalogEntry[] = [
	{ slug: "button", name: "Button", kind: "stable", category: "component" },
	{ slug: "link-button", name: "LinkButton", kind: "catalog", category: "component" },
	{ slug: "text", name: "Text", kind: "catalog", category: "component" },
	{ slug: "label", name: "Label", kind: "stable", category: "component" },
	{ slug: "separator", name: "Separator", kind: "stable", category: "component" },
	{
		slug: "scroll-area",
		name: "ScrollArea",
		kind: "stable",
		category: "component",
		navName: "Scroll Area",
	},
	{ slug: "link", name: "Link", kind: "stable", category: "component" },
	{ slug: "tooltip", name: "Tooltip", kind: "stable", category: "component" },
	{ slug: "theme-toggle", name: "ThemeToggle", kind: "stable", category: "component" },
	{
		slug: "layer-card",
		name: "LayerCard",
		kind: "stable",
		category: "component",
		navName: "Layer Card",
	},
	{
		slug: "basalt-mark",
		name: "BasaltMark",
		kind: "catalog",
		category: "component",
		navName: "Basalt Mark",
	},
	{ slug: "field", name: "Field", kind: "catalog", category: "component" },
	{ slug: "input", name: "Input", kind: "stable", category: "component" },
	{ slug: "input-area", name: "InputArea", kind: "catalog", category: "component" },
	{ slug: "input-group", name: "InputGroup", kind: "catalog", category: "component" },
	{
		slug: "sensitive-input",
		name: "SensitiveInput",
		kind: "catalog",
		category: "component",
		navName: "Sensitive Input",
	},
	{ slug: "checkbox", name: "Checkbox", kind: "stable", category: "component" },
	{ slug: "radio", name: "Radio", kind: "catalog", category: "component" },
	{ slug: "switch", name: "Switch", kind: "stable", category: "component" },
	{ slug: "select", name: "Select", kind: "catalog", category: "component" },
	{ slug: "combobox", name: "Combobox", kind: "catalog", category: "component" },
	{ slug: "autocomplete", name: "Autocomplete", kind: "catalog", category: "component" },
	{
		slug: "date-picker",
		name: "DatePicker",
		kind: "catalog",
		category: "component",
		navName: "Date Picker",
	},
	{ slug: "slider", name: "Slider", kind: "catalog", category: "component" },
	{ slug: "toggle", name: "Toggle", kind: "catalog", category: "component" },
	{ slug: "toggle-group", name: "ToggleGroup", kind: "catalog", category: "component" },
	{
		slug: "segment-control",
		name: "SegmentControl",
		kind: "stable",
		category: "component",
		navName: "Segment Control",
	},
	{ slug: "badge", name: "Badge", kind: "stable", category: "component" },
	{ slug: "banner", name: "Banner", kind: "catalog", category: "component" },
	{ slug: "empty", name: "Empty", kind: "catalog", category: "component" },
	{ slug: "loader", name: "Loader", kind: "catalog", category: "component" },
	{
		slug: "skeleton-line",
		name: "SkeletonLine",
		kind: "catalog",
		category: "component",
		navName: "Skeleton Line",
	},
	{ slug: "meter", name: "Meter", kind: "stable", category: "component" },
	{ slug: "toast", name: "Toast", kind: "stable", category: "component" },
	{
		slug: "clipboard-text",
		name: "ClipboardText",
		kind: "catalog",
		category: "component",
		navName: "Clipboard Text",
	},
	{
		slug: "code",
		name: "Code",
		kind: "catalog",
		category: "component",
		navName: "CodeHighlighted",
	},
	{ slug: "code-block", name: "CodeBlock", kind: "catalog", category: "component" },
	{ slug: "avatar", name: "Avatar", kind: "stable", category: "component" },
	{ slug: "accordion", name: "Accordion", kind: "catalog", category: "component" },
	{ slug: "dialog", name: "Dialog", kind: "stable", category: "component" },
	{ slug: "alert-dialog", name: "AlertDialog", kind: "stable", category: "component" },
	{
		slug: "confirm-dialog",
		name: "ConfirmDialog",
		kind: "stable",
		category: "component",
		navName: "Confirm Dialog",
	},
	{ slug: "popover", name: "Popover", kind: "stable", category: "component" },
	{
		slug: "dropdown-menu",
		name: "DropdownMenu",
		kind: "stable",
		category: "component",
		navName: "Dropdown",
	},
	{ slug: "context-menu", name: "ContextMenu", kind: "catalog", category: "component" },
	{ slug: "hover-card", name: "HoverCard", kind: "catalog", category: "component" },
	{ slug: "sheet", name: "Sheet", kind: "stable", category: "component" },
	{
		slug: "command-palette",
		name: "CommandPalette",
		kind: "stable",
		category: "component",
		navName: "Command Palette",
	},
	{ slug: "tabs", name: "Tabs", kind: "stable", category: "component" },
	{ slug: "table", name: "Table", kind: "catalog", category: "component" },
	{ slug: "data-table", name: "DataTable", kind: "catalog", category: "component" },
	{ slug: "pagination", name: "Pagination", kind: "catalog", category: "component" },
	{ slug: "collapsible", name: "Collapsible", kind: "stable", category: "component" },
	{ slug: "breadcrumbs", name: "Breadcrumbs", kind: "catalog", category: "component" },
	{ slug: "navigation-menu", name: "NavigationMenu", kind: "catalog", category: "component" },
	{ slug: "menu-bar", name: "MenuBar", kind: "catalog", category: "component" },
	{ slug: "toolbar", name: "Toolbar", kind: "catalog", category: "component" },
	{
		slug: "table-of-contents",
		name: "TableOfContents",
		kind: "catalog",
		category: "component",
		navName: "Table of Contents",
	},
	{ slug: "grid", name: "Grid", kind: "catalog", category: "component" },
	{ slug: "sidebar", name: "Sidebar", kind: "stable", category: "component" },
	{ slug: "flow", name: "Flow", kind: "catalog", category: "component" },
	{
		slug: "stat-strip",
		name: "StatStrip",
		kind: "stable",
		category: "component",
		navName: "Stat Strip",
	},
	{
		slug: "table-pager",
		name: "TablePager",
		kind: "stable",
		category: "component",
		navName: "Table Pager",
	},
	{ slug: "theme-provider", name: "ThemeProvider", kind: "provider", category: "component" },
	{ slug: "link-provider", name: "LinkProvider", kind: "provider", category: "component" },
	{ slug: "installation", name: "Installation", kind: "catalog", category: "docs" },
	{ slug: "contributing", name: "Contributing", kind: "catalog", category: "docs" },
	{ slug: "colors", name: "Colors", kind: "catalog", category: "docs" },
	{ slug: "accessibility", name: "Accessibility", kind: "catalog", category: "docs" },
	{ slug: "figma", name: "Figma Resources", kind: "catalog", category: "docs" },
	{ slug: "cli", name: "CLI", kind: "catalog", category: "docs" },
	{ slug: "skill", name: "Design skill", kind: "catalog", category: "docs" },
	{ slug: "registry", name: "Registry", kind: "catalog", category: "docs" },
	{ slug: "changelog", name: "Changelog", kind: "catalog", category: "docs" },
	{ slug: "charts", name: "Charts", kind: "chart", category: "chart" },
	{ slug: "chart-colors", name: "Colors", kind: "chart", category: "chart" },
	{ slug: "timeseries", name: "Timeseries", kind: "chart", category: "chart" },
	{ slug: "maps", name: "Maps", kind: "chart", category: "chart" },
	{ slug: "custom-chart", name: "Custom Chart", kind: "chart", category: "chart" },
	{ slug: "stat-card", name: "StatCard", kind: "chart", category: "chart" },
	{ slug: "slot-bar", name: "SlotBarChart", kind: "chart", category: "chart" },
	{ slug: "bar", name: "BarChart", kind: "chart", category: "chart" },
	{ slug: "line", name: "LineChart", kind: "chart", category: "chart" },
	{ slug: "area", name: "AreaChart", kind: "chart", category: "chart" },
	{ slug: "donut", name: "DonutChart", kind: "chart", category: "chart" },
	{ slug: "grouped-bar", name: "GroupedBarChart", kind: "chart", category: "chart" },
	{ slug: "stacked-bar", name: "StackedBarChart", kind: "chart", category: "chart" },
	{ slug: "sparkline", name: "Sparkline", kind: "chart", category: "chart" },
	{ slug: "heatmap-calendar", name: "HeatmapCalendar", kind: "chart", category: "chart" },
	{ slug: "gauge", name: "Gauge", kind: "chart", category: "chart" },
	{ slug: "radar", name: "RadarChart", kind: "chart", category: "chart" },
	{ slug: "funnel", name: "FunnelChart", kind: "chart", category: "chart" },
	{ slug: "bullet", name: "BulletChart", kind: "chart", category: "chart" },
	{ slug: "timeline", name: "Timeline", kind: "chart", category: "chart" },
	{ slug: "sankey", name: "SankeyChart", kind: "chart", category: "chart", navName: "Sankey" },
	{ slug: "item-list", name: "ItemList", kind: "chart", category: "chart" },
	{ slug: "date-navigation", name: "DateNavigation", kind: "chart", category: "chart" },
	{ slug: "palette", name: "ChartPalette", kind: "chart", category: "chart" },
	{ slug: "page-header", name: "Page Header", kind: "catalog", category: "block" },
	{ slug: "resource-list", name: "Resource List", kind: "catalog", category: "block" },
	{ slug: "delete-resource", name: "Delete Resource", kind: "catalog", category: "block" },
];

export const CATALOG_BY_SLUG = new Map(CATALOG.map((entry) => [entry.slug, entry]));

const DOC_LEAD = [
	"installation",
	"contributing",
	"colors",
	"accessibility",
	"figma",
	"cli",
	"skill",
	"registry",
	"changelog",
];
const CHART_LEAD = ["charts", "chart-colors", "timeseries", "maps", "sankey", "custom-chart"];
const BLOCK_LEAD = ["page-header", "resource-list", "delete-resource"];

export function catalogNavName(entry: CatalogEntry): string {
	return entry.navName ?? entry.name;
}

export function inScopeCatalogSlugs(): string[] {
	return CATALOG.filter(
		(entry) =>
			(entry.category === "component" || entry.category === "chart") && entry.slug !== "maps",
	).map((entry) => entry.slug);
}

function byNavName(a: CatalogEntry, b: CatalogEntry) {
	return catalogNavName(a).localeCompare(catalogNavName(b), "en");
}

export function libraryDocEntries(): CatalogEntry[] {
	return DOC_LEAD.map((slug) => CATALOG_BY_SLUG.get(slug)).filter(
		(entry): entry is CatalogEntry => entry !== undefined,
	);
}

export function libraryNavEntries(category: CatalogCategory): CatalogEntry[] {
	if (category === "docs") {
		return libraryDocEntries();
	}
	if (category === "component") {
		return CATALOG.filter((entry) => entry.category === "component").sort(byNavName);
	}
	if (category === "chart") {
		const lead = CHART_LEAD.map((slug) => CATALOG_BY_SLUG.get(slug)).filter(
			(entry): entry is CatalogEntry => entry !== undefined,
		);
		const rest = CATALOG.filter(
			(entry) => entry.category === "chart" && !CHART_LEAD.includes(entry.slug),
		).sort(byNavName);
		return [...lead, ...rest];
	}
	return BLOCK_LEAD.map((slug) => CATALOG_BY_SLUG.get(slug)).filter(
		(entry): entry is CatalogEntry => entry !== undefined,
	);
}

export function catalogImportPath(entry: CatalogEntry): string {
	if (entry.kind === "provider") {
		return `@nocoo/basalt/providers/${entry.slug.replace(/-provider$/, "")}`;
	}
	if (entry.kind === "chart") {
		return `@nocoo/basalt/charts/${entry.slug}`;
	}
	if (entry.slug === "link-button") {
		return "@nocoo/basalt/components/button";
	}
	if (entry.slug === "code-block") {
		return "@nocoo/basalt/components/code";
	}
	return `@nocoo/basalt/components/${entry.slug}`;
}
