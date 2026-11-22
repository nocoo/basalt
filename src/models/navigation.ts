import {
	CATALOG,
	CATALOG_BY_SLUG,
	CATALOG_CATEGORIES,
	type CatalogCategory,
	type CatalogEntry,
	catalogNavName,
	libraryNavEntries,
} from "../pages/ui/catalog";
import { catalogCategory, catalogCategoryPath } from "../pages/ui/catalog-categories";
import { TEMPLATE_MANIFEST, type TemplateMetadata } from "./template-manifest";

export type NavIconId =
	| "activity"
	| "align-left"
	| "app-window"
	| "award"
	| "bar-chart"
	| "bell"
	| "book-open"
	| "calendar"
	| "chevron-right"
	| "chevrons-down"
	| "chevrons-down-up"
	| "chevrons-up-down"
	| "circle"
	| "clipboard"
	| "code"
	| "columns"
	| "command"
	| "credit-card"
	| "ellipsis"
	| "external-link"
	| "eye"
	| "eye-off"
	| "file-code"
	| "file-question"
	| "file-text"
	| "filter"
	| "folder-input"
	| "form-input"
	| "gauge"
	| "hash"
	| "heart-pulse"
	| "inbox"
	| "keyboard"
	| "layers"
	| "layout-dashboard"
	| "layout-grid"
	| "layout-template"
	| "line-chart"
	| "link"
	| "list"
	| "loader"
	| "loader-circle"
	| "log-in"
	| "megaphone"
	| "menu"
	| "message-circle"
	| "message-square"
	| "minus"
	| "mouse-pointer"
	| "mouse-pointer-click"
	| "navigation"
	| "palette"
	| "panel-left"
	| "panel-right"
	| "piggy-bank"
	| "rectangle-ellipsis"
	| "search"
	| "settings"
	| "sliders"
	| "sparkles"
	| "square"
	| "square-check"
	| "sun"
	| "table"
	| "table-grid"
	| "tag"
	| "text-cursor"
	| "toggle-left"
	| "toggle-right"
	| "trending-up"
	| "triangle-alert"
	| "type"
	| "upload"
	| "user-round"
	| "wallet"
	| "wrench";

export interface ShowcaseRouteEntry {
	path: string;
	title: string;
	inSitemap: boolean;
}

export interface ShellNavItem {
	path: string;
	label: string;
	iconId: NavIconId;
	external?: boolean;
}

export interface ShellNavGroup {
	id: string;
	label: string;
	defaultOpen: boolean;
	items: readonly ShellNavItem[];
}

export interface CatalogNavItem {
	slug: string;
	label: string;
	path: string;
	iconId: NavIconId;
	category: CatalogCategory;
}

export interface LibraryCategoryNavGroup {
	category: CatalogCategory;
	label: string;
	overviewPath: string;
	overviewTitle: string;
	items: readonly CatalogNavItem[];
}

export interface BreadcrumbSegment {
	href?: string;
	label: string;
}

export const SHOWCASE_ROUTES: readonly ShowcaseRouteEntry[] = [
	{ path: "/", title: "Home", inSitemap: true },
	{ path: "/dashboard", title: "Dashboard", inSitemap: true },
	{ path: "/templates", title: "Templates", inSitemap: true },
	{ path: "/ui", title: "Component library", inSitemap: true },
	{ path: "/login", title: "Login", inSitemap: true },
	{ path: "/layout", title: "Layout", inSitemap: true },
	{ path: "/palette", title: "Color Palette", inSitemap: true },
	{ path: "/typeface", title: "Typeface", inSitemap: true },
	{ path: "/forms", title: "Forms", inSitemap: true },
	{ path: "/navigation", title: "Navigation", inSitemap: true },
	{ path: "/accounts", title: "Care accounts", inSitemap: true },
	{ path: "/progress-tracking", title: "Progress Tracking", inSitemap: true },
	{ path: "/flow-comparison", title: "Flow Comparison", inSitemap: true },
	{ path: "/portfolio", title: "Care funds", inSitemap: true },
	{ path: "/loading-states", title: "Loading", inSitemap: true },
	{ path: "/animation", title: "Animation", inSitemap: true },
	{ path: "/tables", title: "Tables", inSitemap: true },
	{ path: "/dialogs", title: "Dialogs", inSitemap: true },
	{ path: "/settings", title: "Settings", inSitemap: true },
	{ path: "/health", title: "Health", inSitemap: true },
	{ path: "/banking", title: "Care funding", inSitemap: true },
	{ path: "/network", title: "Care platform", inSitemap: true },
	{ path: "/static-page", title: "Static Page", inSitemap: true },
	{ path: "/loading", title: "Loading", inSitemap: false },
	{ path: "/404", title: "404 Page", inSitemap: false },
];

export const SHOWCASE_TITLES: Readonly<Record<string, string>> = Object.fromEntries(
	SHOWCASE_ROUTES.map((route) => [route.path, route.title]),
);

export const SIDEBAR_NAV_GROUPS: readonly ShellNavGroup[] = [
	{
		id: "overview",
		label: "Overview",
		defaultOpen: true,
		items: [
			{ label: "Dashboard", iconId: "layout-dashboard", path: "/dashboard" },
			{ label: "Templates", iconId: "layout-template", path: "/templates" },
			{ label: "Settings", iconId: "settings", path: "/settings" },
		],
	},
	{
		id: "scenarios",
		label: "Scenarios",
		defaultOpen: true,
		items: [
			{ label: "Health", iconId: "heart-pulse", path: "/health" },
			{ label: "Care funding", iconId: "wallet", path: "/banking" },
			{ label: "Care platform", iconId: "line-chart", path: "/network" },
			{ label: "Care accounts", iconId: "wallet", path: "/accounts" },
			{ label: "Care funds", iconId: "line-chart", path: "/portfolio" },
			{ label: "Progress Tracking", iconId: "piggy-bank", path: "/progress-tracking" },
			{ label: "Flow Comparison", iconId: "trending-up", path: "/flow-comparison" },
		],
	},
	{
		id: "pages",
		label: "Pages",
		defaultOpen: true,
		items: [
			{ label: "Login", iconId: "log-in", path: "/login", external: true },
			{ label: "Static Page", iconId: "file-text", path: "/static-page", external: true },
			{ label: "Loading", iconId: "loader", path: "/loading", external: true },
			{ label: "404 Page", iconId: "file-question", path: "/404", external: true },
		],
	},
];

export const LIBRARY_GUIDE_ITEMS: readonly ShellNavItem[] = [
	{ label: "Component library", iconId: "book-open", path: "/ui" },
	{ label: "Color Palette", iconId: "palette", path: "/palette" },
	{ label: "Typeface", iconId: "type", path: "/typeface" },
	{ label: "Layout", iconId: "layout-grid", path: "/layout" },
	{ label: "Loading", iconId: "loader", path: "/loading-states" },
	{ label: "Animation", iconId: "sparkles", path: "/animation" },
	{ label: "Tables", iconId: "table-grid", path: "/tables" },
	{ label: "Forms", iconId: "form-input", path: "/forms" },
	{ label: "Navigation", iconId: "navigation", path: "/navigation" },
	{ label: "Dialogs", iconId: "app-window", path: "/dialogs" },
];

export const ALL_COLLAPSED_NAV_ITEMS: readonly ShellNavItem[] = [
	...SIDEBAR_NAV_GROUPS.flatMap((group) => group.items),
	...LIBRARY_GUIDE_ITEMS,
];

export const CATALOG_ICON_IDS: Readonly<Record<string, NavIconId>> = {
	accordion: "chevrons-down-up",
	"alert-dialog": "triangle-alert",
	autocomplete: "search",
	avatar: "user-round",
	badge: "award",
	banner: "megaphone",
	breadcrumbs: "chevron-right",
	button: "rectangle-ellipsis",
	chart: "bar-chart",
	checkbox: "square-check",
	"clipboard-text": "clipboard",
	code: "code",
	"code-block": "file-code",
	collapsible: "chevrons-down",
	combobox: "chevrons-up-down",
	"command-palette": "command",
	"confirm-dialog": "triangle-alert",
	"context-menu": "mouse-pointer",
	"date-picker": "calendar",
	"data-table": "table-grid",
	"description-list": "list",
	dialog: "app-window",
	dock: "panel-right",
	"dropdown-menu": "menu",
	"editable-nav-item": "text-cursor",
	empty: "inbox",
	fab: "sparkles",
	field: "form-input",
	"file-dropzone": "folder-input",
	"filter-bar": "filter",
	grid: "layout-grid",
	"hover-card": "credit-card",
	"icon-picker": "sparkles",
	"inline-editable": "text-cursor",
	input: "text-cursor",
	"input-group": "columns",
	kbd: "keyboard",
	label: "tag",
	"layer-card": "square",
	link: "link",
	"link-button": "external-link",
	"link-provider": "link",
	loader: "loader",
	meter: "gauge",
	"multi-select": "chevrons-up-down",
	"page-header": "layout-template",
	pagination: "ellipsis",
	popover: "message-square",
	progress: "activity",
	radio: "circle",
	"resource-list": "list",
	"responsive-master-detail": "columns",
	"scroll-area": "panel-right",
	"section-rule": "minus",
	"segment-control": "columns",
	select: "chevrons-up-down",
	"sensitive-input": "eye-off",
	separator: "minus",
	sheet: "panel-right",
	sidebar: "panel-left",
	skeleton: "minus",
	slider: "sliders",
	spinner: "loader-circle",
	"stat-card": "hash",
	switch: "toggle-left",
	table: "table",
	"table-of-contents": "list",
	"table-pager": "ellipsis",
	tabs: "columns",
	"tag-badge": "tag",
	"tag-color-picker": "palette",
	text: "type",
	textarea: "align-left",
	"theme-provider": "palette",
	"theme-toggle": "sun",
	toast: "bell",
	toggle: "toggle-right",
	"toggle-group": "toggle-right",
	toolbar: "wrench",
	tooltip: "message-circle",
	"upload-queue": "upload",
};

export const LIBRARY_CATEGORY_GROUPS: readonly LibraryCategoryNavGroup[] = CATALOG_CATEGORIES.map(
	(category) => ({
		category: category.id,
		label: category.label,
		overviewPath: catalogCategoryPath(category.id),
		overviewTitle: `${category.label} overview`,
		items: libraryNavEntries(category.id).map((entry) => ({
			slug: entry.slug,
			label: catalogNavName(entry),
			path: `/ui/${entry.slug}`,
			iconId: CATALOG_ICON_IDS[entry.slug] ?? "rectangle-ellipsis",
			category: entry.category,
		})),
	}),
);

export const CATEGORY_OVERVIEW_ITEMS: readonly ShellNavItem[] = LIBRARY_CATEGORY_GROUPS.map(
	(group) => ({
		label: group.overviewTitle,
		iconId: "book-open",
		path: group.overviewPath,
	}),
);

export function normalizePathname(pathname: string): string {
	if (pathname === "/" || pathname === "") {
		return "/";
	}
	return pathname.replace(/\/+$/, "");
}

export function resolveCatalogContext(pathname: string): {
	entry?: CatalogEntry;
	overviewCategory?: ReturnType<typeof catalogCategory>;
	isSource: boolean;
} {
	const normalized = normalizePathname(pathname);
	if (!normalized.startsWith("/ui/")) {
		return { isSource: false };
	}
	const parts = normalized.slice("/ui/".length).split("/");
	if (parts[0] === "overview" && parts.length === 2) {
		return { overviewCategory: catalogCategory(parts[1]), isSource: false };
	}
	if (parts.length === 1 || (parts.length === 2 && parts[1] === "source")) {
		const entry = CATALOG_BY_SLUG.get(parts[0]);
		return {
			entry,
			isSource: Boolean(entry && parts[1] === "source"),
		};
	}
	return { isSource: false };
}

export function resolveRouteTitle(pathname: string): string {
	const normalized = normalizePathname(pathname);
	const { entry, overviewCategory, isSource } = resolveCatalogContext(normalized);
	if (overviewCategory) {
		return `${overviewCategory.label} overview`;
	}
	if (entry) {
		const navName = catalogNavName(entry);
		return isSource ? `${navName} source` : navName;
	}
	return SHOWCASE_TITLES[normalized] ?? "Dashboard";
}

export function resolveRouteBreadcrumbs(pathname: string): readonly BreadcrumbSegment[] {
	const normalized = normalizePathname(pathname);
	const title = resolveRouteTitle(normalized);
	const { entry, overviewCategory, isSource } = resolveCatalogContext(normalized);
	const isUiSection = normalized === "/ui" || normalized.startsWith("/ui/");
	const crumbs: BreadcrumbSegment[] = [
		normalized === "/dashboard"
			? { label: "Dashboard" }
			: { href: "/dashboard", label: "Dashboard" },
	];

	if (isUiSection) {
		crumbs.push(
			normalized === "/ui"
				? { label: "Component library" }
				: { href: "/ui", label: "Component library" },
		);
	}

	const entryCategory = entry ? catalogCategory(entry.category) : undefined;
	if (entry && entryCategory) {
		crumbs.push({ href: catalogCategoryPath(entryCategory.id), label: entryCategory.label });
	}

	if (overviewCategory) {
		crumbs.push({ label: overviewCategory.label });
	} else if (entry) {
		const navName = catalogNavName(entry);
		crumbs.push(isSource ? { href: `/ui/${entry.slug}`, label: navName } : { label: navName });
		if (isSource) {
			crumbs.push({ label: title });
		}
	} else if (normalized !== "/dashboard" && normalized !== "/ui") {
		crumbs.push({ label: title });
	}

	return crumbs;
}

export function matchesSearchQuery(value: string, query: string): boolean {
	const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
	const normalizedValue = value.toLocaleLowerCase();
	return tokens.every((token) => normalizedValue.includes(token));
}

export interface CommandPaletteCatalogItem {
	slug: string;
	name: string;
	path: string;
	searchValue: string;
}

export interface CommandPaletteResults {
	navGroups: readonly ShellNavGroup[];
	templates: readonly TemplateMetadata[];
	libraryEntries: readonly ShellNavItem[];
	catalogEntries: readonly CommandPaletteCatalogItem[];
}

export function buildCommandPaletteResults(query: string): CommandPaletteResults {
	const navGroups = SIDEBAR_NAV_GROUPS.map((group) => ({
		...group,
		items: group.items.filter((item) => matchesSearchQuery(item.label, query)),
	})).filter((group) => group.items.length > 0);

	const templates = TEMPLATE_MANIFEST.filter((entry) =>
		matchesSearchQuery(`${entry.title} ${entry.slug}`, query),
	);

	const libraryEntries = [...LIBRARY_GUIDE_ITEMS, ...CATEGORY_OVERVIEW_ITEMS].filter((item) =>
		matchesSearchQuery(item.label, query),
	);

	const catalogEntries = CATALOG.filter((entry) =>
		matchesSearchQuery(`${catalogNavName(entry)} ${entry.name} ${entry.slug}`, query),
	).map((entry) => ({
		slug: entry.slug,
		name: catalogNavName(entry),
		path: `/ui/${entry.slug}`,
		searchValue: `${catalogNavName(entry)} ${entry.name} ${entry.slug}`,
	}));

	return {
		navGroups,
		templates,
		libraryEntries,
		catalogEntries,
	};
}
