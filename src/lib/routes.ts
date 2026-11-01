import { CATALOG_CATEGORIES, catalogCategoryPath } from "../pages/ui/catalog-categories";
import { CATALOG_PAGE_STATUS } from "../pages/ui/generated/catalog-page-status";
import { SHOWCASE_PAGES } from "./site";

/**
 * Every URL the client router renders as a real page. The edge worker answers anything else with
 * HTTP 404 so crawlers do not index soft 404s. Built only from the lightweight site, category and
 * generated page-status manifests so the worker bundle stays small.
 */
export const STANDALONE_EXAMPLE_PATHS = [
	"/examples/reader",
	"/examples/list-detail",
	"/examples/workspace",
] as const;

/** The not-found page the worker serves with a 404 status. */
export const NOT_FOUND_PATH = "/404";

const STATIC_APP_PATHS: ReadonlySet<string> = new Set([
	...SHOWCASE_PAGES.map((page) => page.path),
	...STANDALONE_EXAMPLE_PATHS,
	...CATALOG_CATEGORIES.map((category) => catalogCategoryPath(category.id)),
]);

const CATALOG_SLUGS: ReadonlySet<string> = new Set(Object.keys(CATALOG_PAGE_STATUS));

const CATALOG_ROUTE = /^\/ui\/([^/]+)(\/source)?$/;

/** Drops one trailing slash so `/ui/button/` matches the canonical `/ui/button`. */
export function normalizeAppPath(pathname: string): string {
	return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function isKnownAppPath(pathname: string): boolean {
	const path = normalizeAppPath(pathname);
	if (STATIC_APP_PATHS.has(path)) return true;
	const match = CATALOG_ROUTE.exec(path);
	if (!match) return false;
	try {
		return CATALOG_SLUGS.has(decodeURIComponent(match[1]));
	} catch {
		return false;
	}
}
