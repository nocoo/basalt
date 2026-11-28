import { describe, expect, it } from "vitest";
import {
	ALL_COLLAPSED_NAV_ITEMS,
	buildCommandPaletteResults,
	CATALOG_ICON_IDS,
	CATEGORY_OVERVIEW_ITEMS,
	FOUNDATION_NAV_ITEMS,
	LIBRARY_CATEGORY_GROUPS,
	LIBRARY_INDEX_ITEM,
	matchesSearchQuery,
	normalizePathname,
	PATTERN_NAV_ITEMS,
	resolveCatalogContext,
	resolveRouteBreadcrumbs,
	resolveRouteTitle,
	SHOWCASE_ROUTES,
	SHOWCASE_TITLES,
	TEMPLATE_NAV_GROUPS,
} from "@/models/navigation";
import { CATALOG } from "@/pages/ui/catalog";

describe("navigation model", () => {
	it("maps every catalog entry to an icon without dead planned slugs", () => {
		const catalogSlugs = CATALOG.map((entry) => entry.slug).sort();
		expect(Object.keys(CATALOG_ICON_IDS).sort()).toEqual(catalogSlugs);
		expect(Object.keys(CATALOG_ICON_IDS)).toHaveLength(81);
	});

	it("keeps routes, titles, and 4-partition IA coherent", () => {
		expect(SHOWCASE_TITLES["/"]).toBe("Home");
		expect(SHOWCASE_TITLES["/dashboard"]).toBe("Analytics overview");
		expect(SHOWCASE_TITLES["/templates"]).toBeUndefined();
		expect(SHOWCASE_TITLES["/settings"]).toBeUndefined();
		expect(SHOWCASE_TITLES["/login"]).toBeUndefined();
		expect(SHOWCASE_TITLES["/accounts"]).toBeUndefined();
		expect(SHOWCASE_ROUTES.some((route) => route.path === "/404" && !route.inSitemap)).toBe(true);

		expect(TEMPLATE_NAV_GROUPS.map((group) => group.label)).toEqual([
			"Workspaces",
			"Dashboards",
			"Standalone",
		]);
		expect(PATTERN_NAV_ITEMS.map((item) => item.label)).toEqual([
			"Forms",
			"Tables",
			"Navigation",
			"Dialogs",
		]);
		expect(FOUNDATION_NAV_ITEMS.map((item) => item.label)).toEqual([
			"Color Palette",
			"Typeface",
			"Layout",
			"Motion",
			"Loading",
		]);
		expect(LIBRARY_INDEX_ITEM.path).toBe("/ui");
		expect(ALL_COLLAPSED_NAV_ITEMS).toHaveLength(
			TEMPLATE_NAV_GROUPS.reduce((sum, group) => sum + group.items.length, 0) +
				PATTERN_NAV_ITEMS.length +
				FOUNDATION_NAV_ITEMS.length +
				1,
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

	it("resolves titles and partition breadcrumb chains across templates, patterns, foundations, and library", () => {
		expect(resolveRouteTitle("/dashboard")).toBe("Analytics overview");
		expect(resolveRouteTitle("/templates/agent-workspace")).toBe("Agent workspace");
		expect(resolveRouteTitle("/templates/not-found")).toBe("Error 404");
		expect(resolveRouteTitle("/ui/overview/action")).toBe("Actions overview");
		expect(resolveRouteTitle("/ui/command-palette")).toBe("Command Palette");
		expect(resolveRouteTitle("/ui/button/source")).toBe("Button source");
		expect(resolveRouteTitle("/unknown-route")).toBe("Analytics overview");
		expect(resolveRouteBreadcrumbs("/unknown-route")).toEqual([{ label: "Analytics overview" }]);

		expect(resolveRouteBreadcrumbs("/dashboard")).toEqual([
			{ label: "Templates" },
			{ label: "Analytics overview" },
		]);
		expect(resolveRouteBreadcrumbs("/templates/agent-workspace")).toEqual([
			{ label: "Templates" },
			{ label: "Agent workspace" },
		]);
		expect(resolveRouteBreadcrumbs("/forms")).toEqual([{ label: "Patterns" }, { label: "Forms" }]);
		expect(resolveRouteBreadcrumbs("/palette")).toEqual([
			{ label: "Foundations" },
			{ label: "Color Palette" },
		]);
		expect(resolveRouteBreadcrumbs("/ui")).toEqual([{ label: "Component library" }]);
		expect(resolveRouteBreadcrumbs("/ui/overview/action")).toEqual([
			{ href: "/ui", label: "Component library" },
			{ label: "Actions" },
		]);
		expect(resolveRouteBreadcrumbs("/ui/button")).toEqual([
			{ href: "/ui", label: "Component library" },
			{ href: "/ui/overview/action", label: "Actions" },
			{ label: "Button" },
		]);
		expect(resolveRouteBreadcrumbs("/ui/button/source")).toEqual([
			{ href: "/ui", label: "Component library" },
			{ href: "/ui/overview/action", label: "Actions" },
			{ href: "/ui/button", label: "Button" },
			{ label: "Button source" },
		]);
	});

	it("filters command palette entries across all four partitions", () => {
		expect(matchesSearchQuery("Actions overview", "  overview   actions ")).toBe(true);
		expect(matchesSearchQuery("Actions overview", "missing")).toBe(false);

		const all = buildCommandPaletteResults("");
		expect(all.templateGroups).toHaveLength(TEMPLATE_NAV_GROUPS.length);
		expect(all.patterns).toHaveLength(PATTERN_NAV_ITEMS.length);
		expect(all.foundations).toHaveLength(FOUNDATION_NAV_ITEMS.length);
		expect(all.catalogEntries).toHaveLength(81);

		const filtered = buildCommandPaletteResults("actions overview");
		expect(filtered.templateGroups).toEqual([]);
		expect(filtered.patterns).toEqual([]);
		expect(filtered.foundations).toEqual([]);
		expect(filtered.libraryEntries.map((item) => item.path)).toEqual(["/ui/overview/action"]);
		expect(filtered.catalogEntries).toEqual([]);

		const agent = buildCommandPaletteResults("agent workspace");
		expect(agent.templateGroups.flatMap((group) => group.items).map((item) => item.path)).toEqual([
			"/templates/agent-workspace",
		]);
	});
});
