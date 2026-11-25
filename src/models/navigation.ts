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
import { getTemplateByManifestSlug } from "./templates";

export type NavIconId =
	| "activity"
	| "align-left"
	| "app-window"
	| "award"
	| "bar-chart"
	| "bell"
	| "book-open"
	| "bot"
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
	{ path: "/dashboard", title: "Analytics overview", inSitemap: true },
	{ path: "/banking", title: "Finance & wealth", inSitemap: true },
	{ path: "/network", title: "Network operations", inSitemap: true },
	{ path: "/health", title: "Health telemetry", inSitemap: true },
	{ path: "/forms", title: "Forms", inSitemap: true },
	{ path: "/tables", title: "Tables", inSitemap: true },
	{ path: "/navigation", title: "Navigation", inSitemap: true },
	{ path: "/dialogs", title: "Dialogs", inSitemap: true },
	{ path: "/palette", title: "Color Palette", inSitemap: true },
	{ path: "/typeface", title: "Typeface", inSitemap: true },
	{ path: "/layout", title: "Layout", inSitemap: true },
	{ path: "/animation", title: "Motion", inSitemap: true },
	{ path: "/loading-states", title: "Loading", inSitemap: true },
	{ path: "/ui", title: "Component library", inSitemap: true },
	{ path: "/404", title: "404 Page", inSitemap: false },
];

export const SHOWCASE_TITLES: Readonly<Record<string, string>> = Object.fromEntries(
	SHOWCASE_ROUTES.map((route) => [route.path, route.title]),
);

export const TEMPLATE_NAV_GROUPS: readonly ShellNavGroup[] = [
	{
		id: "workspaces",
		label: "Workspaces",
		defaultOpen: true,
		items: [
			{ label: "Agent workspace", iconId: "bot", path: "/templates/agent-workspace" },
			{ label: "Ops inbox", iconId: "inbox", path: "/templates/ops-inbox" },
			{ label: "Workspace settings", iconId: "settings", path: "/templates/workspace-settings" },
		],
	},
	{
		id: "dashboards",
		label: "Dashboards",
		defaultOpen: true,
		items: [
			{
				label: "Executive dashboard",
				iconId: "layout-template",
				path: "/templates/executive-dashboard",
			},
			{ label: "Analytics overview", iconId: "layout-dashboard", path: "/dashboard" },
			{ label: "Finance & wealth", iconId: "wallet", path: "/banking" },
			{ label: "Network operations", iconId: "line-chart", path: "/network" },
			{ label: "Health telemetry", iconId: "heart-pulse", path: "/health" },
		],
	},
	{
		id: "standalone",
		label: "Standalone",
		defaultOpen: true,
		items: [
			{ label: "Visitor login", iconId: "log-in", path: "/templates/visitor-login" },
			{ label: "Document page", iconId: "file-text", path: "/templates/document-page" },
			{ label: "Error 404", iconId: "file-question", path: "/templates/not-found" },
		],
	},
];

export const PATTERN_NAV_ITEMS: readonly ShellNavItem[] = [
	{ label: "Forms", iconId: "form-input", path: "/forms" },
	{ label: "Tables", iconId: "table-grid", path: "/tables" },
	{ label: "Navigation", iconId: "navigation", path: "/navigation" },
	{ label: "Dialogs", iconId: "app-window", path: "/dialogs" },
];

export const FOUNDATION_NAV_ITEMS: readonly ShellNavItem[] = [
	{ label: "Color Palette", iconId: "palette", path: "/palette" },
	{ label: "Typeface", iconId: "type", path: "/typeface" },
	{ label: "Layout", iconId: "layout-grid", path: "/layout" },
	{ label: "Motion", iconId: "sparkles", path: "/animation" },
	{ label: "Loading", iconId: "loader", path: "/loading-states" },
];

export const LIBRARY_INDEX_ITEM: ShellNavItem = {
	label: "Component library",
	iconId: "book-open",
	path: "/ui",
};

export const ALL_COLLAPSED_NAV_ITEMS: readonly ShellNavItem[] = [
	...TEMPLATE_NAV_GROUPS.flatMap((group) => group.items),
	...PATTERN_NAV_ITEMS,
	...FOUNDATION_NAV_ITEMS,
	LIBRARY_INDEX_ITEM,
];

const TEMPLATE_DASHBOARD_PATHS: ReadonlySet<string> = new Set([
	"/dashboard",
	"/banking",
	"/network",
	"/health",
]);
const PATTERN_PATHS: ReadonlySet<string> = new Set(PATTERN_NAV_ITEMS.map((item) => item.path));
const FOUNDATION_PATHS: ReadonlySet<string> = new Set(
	FOUNDATION_NAV_ITEMS.map((item) => item.path),
);

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

function resolveTemplateSlugFromPath(normalized: string): string | undefined {
	if (!normalized.startsWith("/templates/")) {
		return undefined;
	}
	const parts = normalized.slice("/templates/".length).split("/");
	return parts.length === 1 ? parts[0] : undefined;
}

export function resolveRouteTitle(pathname: string): string {
	const normalized = normalizePathname(pathname);
	const templateSlug = resolveTemplateSlugFromPath(normalized);
	if (templateSlug) {
		const template = getTemplateByManifestSlug(templateSlug);
		if (template) {
			return template.title;
		}
	}
	const { entry, overviewCategory, isSource } = resolveCatalogContext(normalized);
	if (overviewCategory) {
		return `${overviewCategory.label} overview`;
	}
	if (entry) {
		const navName = catalogNavName(entry);
		return isSource ? `${navName} source` : navName;
	}
	return SHOWCASE_TITLES[normalized] ?? "Analytics overview";
}

export function resolveRouteBreadcrumbs(pathname: string): readonly BreadcrumbSegment[] {
	const normalized = normalizePathname(pathname);
	const title = resolveRouteTitle(normalized);
	const { entry, overviewCategory, isSource } = resolveCatalogContext(normalized);
	const isUiSection = normalized === "/ui" || normalized.startsWith("/ui/");

	if (isUiSection) {
		const crumbs: BreadcrumbSegment[] = [
			normalized === "/ui"
				? { label: "Component library" }
				: { href: "/ui", label: "Component library" },
		];
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
		}
		return crumbs;
	}

	const templateSlug = resolveTemplateSlugFromPath(normalized);
	if (
		(templateSlug && getTemplateByManifestSlug(templateSlug)) ||
		TEMPLATE_DASHBOARD_PATHS.has(normalized)
	) {
		return [{ label: "Templates" }, { label: title }];
	}

	if (PATTERN_PATHS.has(normalized)) {
		return [{ label: "Patterns" }, { label: title }];
	}

	if (FOUNDATION_PATHS.has(normalized)) {
		return [{ label: "Foundations" }, { label: title }];
	}

	return [{ label: title }];
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
	templateGroups: readonly ShellNavGroup[];
	patterns: readonly ShellNavItem[];
	foundations: readonly ShellNavItem[];
	libraryEntries: readonly ShellNavItem[];
	catalogEntries: readonly CommandPaletteCatalogItem[];
}

export function buildCommandPaletteResults(query: string): CommandPaletteResults {
	const templateGroups = TEMPLATE_NAV_GROUPS.map((group) => ({
		...group,
		items: group.items.filter((item) => matchesSearchQuery(`${item.label} ${item.path}`, query)),
	})).filter((group) => group.items.length > 0);

	const patterns = PATTERN_NAV_ITEMS.filter((item) => matchesSearchQuery(item.label, query));
	const foundations = FOUNDATION_NAV_ITEMS.filter((item) => matchesSearchQuery(item.label, query));

	const libraryEntries = [LIBRARY_INDEX_ITEM, ...CATEGORY_OVERVIEW_ITEMS].filter((item) =>
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
		templateGroups,
		patterns,
		foundations,
		libraryEntries,
		catalogEntries,
	};
}
