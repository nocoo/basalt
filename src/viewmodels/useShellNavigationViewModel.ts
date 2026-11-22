import { useMemo } from "react";
import { useLocation } from "react-router";
import { pageMetadata } from "@/lib/metadata";
import {
	ALL_COLLAPSED_NAV_ITEMS,
	buildCommandPaletteResults,
	LIBRARY_CATEGORY_GROUPS,
	LIBRARY_GUIDE_ITEMS,
	resolveRouteBreadcrumbs,
	resolveRouteTitle,
	SIDEBAR_NAV_GROUPS,
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
		navGroups: SIDEBAR_NAV_GROUPS,
		libraryGuideItems: LIBRARY_GUIDE_ITEMS,
		libraryCategoryGroups: LIBRARY_CATEGORY_GROUPS,
		collapsedNavItems: ALL_COLLAPSED_NAV_ITEMS,
		commandResults,
	};
}
