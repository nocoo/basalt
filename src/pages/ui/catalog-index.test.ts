import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import {
	CATALOG_INDEX_GROUPS,
	CATALOG_INDEX_ITEMS,
	CATALOG_INDEX_READY_COUNT,
	catalogReleaseStatus,
	createCatalogIndex,
	resolveCatalogPageState,
} from "./catalog-index";
import type { CatalogScenario } from "./catalog-scenario";
import type { CatalogDocs } from "./catalog-source";

const DOCS = {} as CatalogDocs;
const HERO: CatalogScenario = {
	id: "fixture-default",
	title: "Default",
	code: "export default null",
	render: () => null,
};

describe("catalog index model", () => {
	it("groups every non-doc catalog entry exactly once", () => {
		expect(CATALOG_INDEX_GROUPS.map((group) => group.label)).toEqual([
			"Components",
			"Charts",
			"Blocks",
		]);
		expect(CATALOG_INDEX_GROUPS.map((group) => group.items.length)).toEqual([60, 24, 3]);
		expect(CATALOG_INDEX_ITEMS).toHaveLength(87);

		const slugs = CATALOG_INDEX_ITEMS.map((item) => item.entry.slug);
		expect(new Set(slugs).size).toBe(87);
		expect(slugs).toEqual(
			CATALOG.filter((entry) => entry.category !== "docs").map((entry) => entry.slug),
		);
	});

	it("models the current page and release states independently", () => {
		expect(CATALOG_INDEX_READY_COUNT).toBe(84);
		expect(
			CATALOG_INDEX_ITEMS.filter((item) => item.pageStatus === "planned").map(
				(item) => item.entry.slug,
			),
		).toEqual(["maps", "resource-list", "delete-resource"]);
		expect(new Set(CATALOG_INDEX_ITEMS.map((item) => item.releaseStatus))).toEqual(
			new Set(["stable", "catalog"]),
		);

		const groups = createCatalogIndex({
			entries: [
				{ slug: "stable-planned", name: "Stable planned", kind: "stable", category: "component" },
				{ slug: "catalog-ready", name: "Catalog ready", kind: "catalog", category: "component" },
			],
			docsBySlug: { "catalog-ready": DOCS },
			heroForSlug: (slug) => (slug === "catalog-ready" ? HERO : undefined),
		});
		expect(
			groups[0]?.items.map(({ releaseStatus, pageStatus }) => [releaseStatus, pageStatus]),
		).toEqual([
			["stable", "planned"],
			["catalog", "ready"],
		]);
	});

	it("requires both docs and hero for a ready page", () => {
		expect(resolveCatalogPageState("missing-docs", {}, () => HERO).pageStatus).toBe("planned");
		expect(
			resolveCatalogPageState("missing-hero", { "missing-hero": DOCS }, () => undefined).pageStatus,
		).toBe("planned");
		expect(resolveCatalogPageState("ready", { ready: DOCS }, () => HERO)).toMatchObject({
			pageStatus: "ready",
			docs: DOCS,
			hero: HERO,
		});
	});

	it("maps every known kind and rejects unknown kinds", () => {
		expect(catalogReleaseStatus("stable")).toBe("stable");
		expect(catalogReleaseStatus("provider")).toBe("stable");
		expect(catalogReleaseStatus("catalog")).toBe("catalog");
		expect(catalogReleaseStatus("chart")).toBe("catalog");
		expect(() => catalogReleaseStatus("experimental" as never)).toThrow(
			"Unknown catalog kind: experimental",
		);
	});

	it("rejects unknown categories and duplicate input slugs", () => {
		expect(() =>
			createCatalogIndex({
				entries: [
					{ slug: "unknown", name: "Unknown", kind: "catalog", category: "unknown" as never },
				],
				docsBySlug: {},
				heroForSlug: () => undefined,
			}),
		).toThrow("Unknown catalog category: unknown");

		expect(() =>
			createCatalogIndex({
				entries: [
					{ slug: "same", name: "First", kind: "stable", category: "component" },
					{ slug: "same", name: "Second", kind: "catalog", category: "chart" },
				],
				docsBySlug: {},
				heroForSlug: () => undefined,
			}),
		).toThrow("Duplicate catalog slug: same");
	});
});
