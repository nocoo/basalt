import { describe, expect, it } from "vitest";
import {
	ALL_COLLAPSED_NAV_ITEMS,
	buildCommandPaletteResults,
	CATALOG_ICON_IDS,
	CATEGORY_OVERVIEW_ITEMS,
	LIBRARY_CATEGORY_GROUPS,
	LIBRARY_GUIDE_ITEMS,
	matchesSearchQuery,
	normalizePathname,
	resolveCatalogContext,
	resolveRouteBreadcrumbs,
	resolveRouteTitle,
	SHOWCASE_ROUTES,
	SHOWCASE_TITLES,
	SIDEBAR_NAV_GROUPS,
} from "@/models/navigation";
import { CATALOG } from "@/pages/ui/catalog";

describe("navigation model", () => {
	it("maps every catalog entry to an icon without dead planned slugs", () => {
		const catalogSlugs = CATALOG.map((entry) => entry.slug).sort();
		expect(Object.keys(CATALOG_ICON_IDS).sort()).toEqual(catalogSlugs);
		expect(Object.keys(CATALOG_ICON_IDS)).toHaveLength(81);
	});

	it("keeps routes, titles, and streamlined IA coherent", () => {
		expect(SHOWCASE_TITLES["/"]).toBe("Home");
		expect(SHOWCASE_TITLES["/dashboard"]).toBe("Dashboard");
		expect(SHOWCASE_TITLES["/wearable"]).toBeUndefined();
		expect(SHOWCASE_TITLES["/components"]).toBeUndefined();
		expect(SHOWCASE_ROUTES.some((route) => route.path === "/loading" && !route.inSitemap)).toBe(
			true,
		);
		expect(SIDEBAR_NAV_GROUPS.map((group) => group.label)).toEqual([
			"Overview",
			"Scenarios",
			"Pages",
		]);
		expect(LIBRARY_GUIDE_ITEMS).toHaveLength(10);
		expect(ALL_COLLAPSED_NAV_ITEMS).toHaveLength(
			SIDEBAR_NAV_GROUPS.reduce((sum, group) => sum + group.items.length, 0) +
				LIBRARY_GUIDE_ITEMS.length,
		);
		expect(CATEGORY_OVERVIEW_ITEMS).toHaveLength(LIBRARY_CATEGORY_GROUPS.length);
	});

	it("normalizes pathnames and resolves catalog context", () => {
		expect(normalizePathname("")).toBe("/");
		expect(normalizePathname("/")).toBe("/");
		expect(normalizePathname("/ui/button///")).toBe("/ui/button");

		expect(resolveCatalogContext("/dashboard")).toEqual({ isSource: false });
		expect(resolveCatalogContext("/ui/overview/action").overviewCategory?.label).toBe("Actions");
		expect(resolveCatalogContext("/ui/button")).toMatchObject({
			entry: { slug: "button" },
			isSource: false,
		});
		expect(resolveCatalogContext("/ui/button/source")).toMatchObject({
			entry: { slug: "button" },
			isSource: true,
		});
		expect(resolveCatalogContext("/ui/unknown/extra")).toEqual({ isSource: false });
	});

	it("resolves titles and breadcrumb chains across showcase and library routes", () => {
		expect(resolveRouteTitle("/dashboard")).toBe("Dashboard");
		expect(resolveRouteTitle("/ui/overview/action")).toBe("Actions overview");
		expect(resolveRouteTitle("/ui/command-palette")).toBe("Command Palette");
		expect(resolveRouteTitle("/ui/button/source")).toBe("Button source");
		expect(resolveRouteTitle("/unknown-route")).toBe("Dashboard");

		expect(resolveRouteBreadcrumbs("/dashboard")).toEqual([{ label: "Dashboard" }]);
		expect(resolveRouteBreadcrumbs("/settings")).toEqual([
			{ href: "/dashboard", label: "Dashboard" },
			{ label: "Settings" },
		]);
		expect(resolveRouteBreadcrumbs("/ui")).toEqual([
			{ href: "/dashboard", label: "Dashboard" },
			{ label: "Component library" },
		]);
		expect(resolveRouteBreadcrumbs("/ui/overview/action")).toEqual([
			{ href: "/dashboard", label: "Dashboard" },
			{ href: "/ui", label: "Component library" },
			{ label: "Actions" },
		]);
		expect(resolveRouteBreadcrumbs("/ui/button/source")).toEqual([
			{ href: "/dashboard", label: "Dashboard" },
			{ href: "/ui", label: "Component library" },
			{ href: "/ui/overview/action", label: "Actions" },
			{ href: "/ui/button", label: "Button" },
			{ label: "Button source" },
		]);
	});

	it("filters command palette entries by tokenized query", () => {
		expect(matchesSearchQuery("Actions overview", "  overview   actions ")).toBe(true);
		expect(matchesSearchQuery("Actions overview", "missing")).toBe(false);

		const all = buildCommandPaletteResults("");
		expect(all.navGroups).toHaveLength(SIDEBAR_NAV_GROUPS.length);
		expect(all.catalogEntries).toHaveLength(81);

		const filtered = buildCommandPaletteResults("actions overview");
		expect(filtered.navGroups).toEqual([]);
		expect(filtered.libraryEntries.map((item) => item.path)).toEqual(["/ui/overview/action"]);
		expect(filtered.catalogEntries).toEqual([]);
	});
});
