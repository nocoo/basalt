import { useMemo } from "react";
import { useLocation } from "react-router";
import { pageMetadata } from "@/lib/metadata";
import {
	ALL_COLLAPSED_NAV_ITEMS,
	buildCommandPaletteResults,
	FOUNDATION_NAV_ITEMS,
	LIBRARY_CATEGORY_GROUPS,
	LIBRARY_INDEX_ITEM,
	PATTERN_NAV_ITEMS,
	resolveRouteBreadcrumbs,
	resolveRouteTitle,
	TEMPLATE_NAV_GROUPS,
} from "@/models/navigation";

export function useShellNavigationViewModel(searchQuery = "") {
	const { pathname } = useLocation();

	const title = useMemo(() => resolveRouteTitle(pathname), [pathname]);
	const breadcrumbs = useMemo(() => resolveRouteBreadcrumbs(pathname), [pathname]);
	const metadata = useMemo(() => pageMetadata(pathname, title), [pathname, title]);
	const commandResults = useMemo(() => buildCommandPaletteResults(searchQuery), [searchQuery]);

	return {
		pathname,
		title,
		breadcrumbs,
		metadata,
		templateNavGroups: TEMPLATE_NAV_GROUPS,
		patternNavItems: PATTERN_NAV_ITEMS,
		foundationNavItems: FOUNDATION_NAV_ITEMS,
		libraryIndexItem: LIBRARY_INDEX_ITEM,
		libraryCategoryGroups: LIBRARY_CATEGORY_GROUPS,
		collapsedNavItems: ALL_COLLAPSED_NAV_ITEMS,
		commandResults,
	};
}
