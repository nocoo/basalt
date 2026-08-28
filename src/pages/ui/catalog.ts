export type CatalogKind = "stable" | "catalog" | "chart" | "provider";

export type CatalogCategory =
	| "atom"
	| "form"
	| "feedback"
	| "overlay"
	| "structure"
	| "chart"
	| "provider";

export interface CatalogEntry {
	slug: string;
	name: string;
	kind: CatalogKind;
	category: CatalogCategory;
}

export const CATALOG_CATEGORIES: { id: CatalogCategory; label: string }[] = [
	{ id: "atom", label: "Atoms" },
	{ id: "form", label: "Forms" },
	{ id: "feedback", label: "Feedback" },
	{ id: "overlay", label: "Overlays" },
	{ id: "structure", label: "Structure" },
	{ id: "chart", label: "Charts" },
	{ id: "provider", label: "Providers" },
];

export const CATALOG: CatalogEntry[] = [
	{ slug: "button", name: "Button", kind: "stable", category: "atom" },
	{ slug: "link-button", name: "LinkButton", kind: "catalog", category: "atom" },
	{ slug: "text", name: "Text", kind: "catalog", category: "atom" },
	{ slug: "label", name: "Label", kind: "stable", category: "atom" },
	{ slug: "separator", name: "Separator", kind: "stable", category: "atom" },
	{ slug: "link", name: "Link", kind: "stable", category: "atom" },
	{ slug: "tooltip", name: "Tooltip", kind: "stable", category: "atom" },
	{ slug: "theme-toggle", name: "ThemeToggle", kind: "stable", category: "atom" },
	{ slug: "layer-card", name: "LayerCard", kind: "stable", category: "atom" },
	{ slug: "basalt-mark", name: "BasaltMark", kind: "catalog", category: "atom" },
	{ slug: "field", name: "Field", kind: "catalog", category: "form" },
	{ slug: "input", name: "Input", kind: "stable", category: "form" },
	{ slug: "input-area", name: "InputArea", kind: "catalog", category: "form" },
	{ slug: "input-group", name: "InputGroup", kind: "catalog", category: "form" },
	{ slug: "sensitive-input", name: "SensitiveInput", kind: "catalog", category: "form" },
	{ slug: "checkbox", name: "Checkbox", kind: "stable", category: "form" },
	{ slug: "radio", name: "Radio", kind: "catalog", category: "form" },
	{ slug: "switch", name: "Switch", kind: "stable", category: "form" },
	{ slug: "select", name: "Select", kind: "catalog", category: "form" },
	{ slug: "combobox", name: "Combobox", kind: "catalog", category: "form" },
	{ slug: "autocomplete", name: "Autocomplete", kind: "catalog", category: "form" },
	{ slug: "date-picker", name: "DatePicker", kind: "catalog", category: "form" },
	{ slug: "slider", name: "Slider", kind: "catalog", category: "form" },
	{ slug: "toggle", name: "Toggle", kind: "catalog", category: "form" },
	{ slug: "toggle-group", name: "ToggleGroup", kind: "catalog", category: "form" },
	{ slug: "badge", name: "Badge", kind: "stable", category: "feedback" },
	{ slug: "banner", name: "Banner", kind: "catalog", category: "feedback" },
	{ slug: "empty", name: "Empty", kind: "catalog", category: "feedback" },
	{ slug: "loader", name: "Loader", kind: "catalog", category: "feedback" },
	{ slug: "skeleton-line", name: "SkeletonLine", kind: "catalog", category: "feedback" },
	{ slug: "meter", name: "Meter", kind: "stable", category: "feedback" },
	{ slug: "toast", name: "Toast", kind: "stable", category: "feedback" },
	{ slug: "clipboard-text", name: "ClipboardText", kind: "catalog", category: "feedback" },
	{ slug: "code", name: "Code", kind: "catalog", category: "feedback" },
	{ slug: "code-block", name: "CodeBlock", kind: "catalog", category: "feedback" },
	{ slug: "avatar", name: "Avatar", kind: "stable", category: "feedback" },
	{ slug: "accordion", name: "Accordion", kind: "catalog", category: "feedback" },
	{ slug: "dialog", name: "Dialog", kind: "stable", category: "overlay" },
	{ slug: "alert-dialog", name: "AlertDialog", kind: "stable", category: "overlay" },
	{ slug: "popover", name: "Popover", kind: "stable", category: "overlay" },
	{ slug: "dropdown-menu", name: "DropdownMenu", kind: "stable", category: "overlay" },
	{ slug: "context-menu", name: "ContextMenu", kind: "catalog", category: "overlay" },
	{ slug: "hover-card", name: "HoverCard", kind: "catalog", category: "overlay" },
	{ slug: "sheet", name: "Sheet", kind: "stable", category: "overlay" },
	{ slug: "command-palette", name: "CommandPalette", kind: "stable", category: "overlay" },
	{ slug: "tabs", name: "Tabs", kind: "stable", category: "structure" },
	{ slug: "table", name: "Table", kind: "catalog", category: "structure" },
	{ slug: "data-table", name: "DataTable", kind: "catalog", category: "structure" },
	{ slug: "pagination", name: "Pagination", kind: "catalog", category: "structure" },
	{ slug: "collapsible", name: "Collapsible", kind: "stable", category: "structure" },
	{ slug: "breadcrumbs", name: "Breadcrumbs", kind: "catalog", category: "structure" },
	{ slug: "navigation-menu", name: "NavigationMenu", kind: "catalog", category: "structure" },
	{ slug: "menu-bar", name: "MenuBar", kind: "catalog", category: "structure" },
	{ slug: "toolbar", name: "Toolbar", kind: "catalog", category: "structure" },
	{ slug: "table-of-contents", name: "TableOfContents", kind: "catalog", category: "structure" },
	{ slug: "grid", name: "Grid", kind: "catalog", category: "structure" },
	{ slug: "sidebar", name: "Sidebar", kind: "stable", category: "structure" },
	{ slug: "flow", name: "Flow", kind: "catalog", category: "structure" },
	{ slug: "theme-provider", name: "ThemeProvider", kind: "provider", category: "provider" },
	{ slug: "link-provider", name: "LinkProvider", kind: "provider", category: "provider" },
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
	{ slug: "sankey", name: "SankeyChart", kind: "chart", category: "chart" },
	{ slug: "item-list", name: "ItemList", kind: "chart", category: "chart" },
	{ slug: "date-navigation", name: "DateNavigation", kind: "chart", category: "chart" },
	{ slug: "palette", name: "ChartPalette", kind: "chart", category: "chart" },
];

export const CATALOG_BY_SLUG = new Map(CATALOG.map((entry) => [entry.slug, entry]));
