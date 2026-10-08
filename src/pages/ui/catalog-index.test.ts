import { describe, expect, it } from "vitest";
import { CATALOG, CATALOG_CATEGORIES } from "./catalog";
import { loadCatalogContentRecord } from "./catalog-content-registry";
import {
	catalogReleaseStatus,
	createCatalogIndex,
	DEFAULT_CATALOG_INDEX_QUERY,
	filterCatalogIndexGroups,
	normalizeCatalogIndexQuery,
	normalizeCatalogSearchText,
	parseCatalogIndexQuery,
	resolveCatalogPageState,
	serializeCatalogIndexQuery,
} from "./catalog-index";
import { loadCatalogIndex } from "./catalog-index-loader";
import type { CatalogScenario } from "./catalog-scenario";
import type { CatalogDocs } from "./catalog-source";

const DOCS = {} as CatalogDocs;
const HERO: CatalogScenario = {
	id: "fixture-default",
	title: "Default",
	code: "export default null",
	render: () => null,
};
const catalogContent = await loadCatalogContentRecord();
const catalogIndex = await loadCatalogIndex();
const CATALOG_INDEX_GROUPS = catalogIndex.groups;
const CATALOG_INDEX_ITEMS = catalogIndex.items;
const CATALOG_INDEX_READY_COUNT = catalogIndex.readyCount;
const catalogDocs = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.docs]),
);
const catalogHero = (slug: string) => catalogContent[slug]?.examples[0];

describe("catalog index model", () => {
	it("groups every catalog entry exactly once", () => {
		expect(loadCatalogIndex()).toBe(loadCatalogIndex());
		expect(CATALOG_INDEX_GROUPS.map((group) => group.label)).toEqual(
			CATALOG_CATEGORIES.map((category) => category.label),
		);
		expect(CATALOG_INDEX_GROUPS.map((group) => group.items.length)).toEqual([
			2, 21, 2, 10, 32, 12, 14, 25, 3,
		]);
		expect(CATALOG_INDEX_ITEMS).toHaveLength(121);

		const slugs = CATALOG_INDEX_ITEMS.map((item) => item.entry.slug);
		expect(new Set(slugs).size).toBe(121);
		expect(new Set(slugs)).toEqual(new Set(CATALOG.map((entry) => entry.slug)));
	});

	it("models the current page and release states independently", () => {
		expect(CATALOG_INDEX_READY_COUNT).toBe(120);
		expect(
			CATALOG_INDEX_ITEMS.filter((item) => item.pageStatus === "planned").map(
				(item) => item.entry.slug,
			),
		).toEqual(["maps"]);
		expect(new Set(CATALOG_INDEX_ITEMS.map((item) => item.releaseStatus))).toEqual(
			new Set(["stable", "catalog"]),
		);

		const groups = createCatalogIndex({
			entries: [
				{
					slug: "stable-planned",
					name: "Stable planned",
					exportName: "StablePlanned",
					importPath: "@nocoo/basalt/components/stable-planned",
					hasRootBarrel: true,
					kind: "stable",
					category: "action",
				},
				{
					slug: "catalog-ready",
					name: "Catalog ready",
					exportName: "CatalogReady",
					importPath: "@nocoo/basalt/components/catalog-ready",
					hasRootBarrel: false,
					kind: "catalog",
					category: "action",
				},
			],
			docsBySlug: { "catalog-ready": DOCS },
			heroForSlug: (slug) => (slug === "catalog-ready" ? HERO : undefined),
		});
		expect(
			groups
				.find((group) => group.id === "action")
				?.items.map(({ releaseStatus, pageStatus }) => [releaseStatus, pageStatus]),
		).toEqual([
			["stable", "planned"],
			["catalog", "ready"],
		]);
	});

	it("models all public catalog navigation as 93 ready and maps planned", () => {
		const states = CATALOG.map((entry) => ({
			slug: entry.slug,
			pageStatus: resolveCatalogPageState(entry.slug, catalogDocs, catalogHero).pageStatus,
		}));
		expect(states.filter((item) => item.pageStatus === "ready")).toHaveLength(120);
		expect(states.filter((item) => item.pageStatus === "planned").map((item) => item.slug)).toEqual(
			["maps"],
		);
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
					{
						slug: "unknown",
						name: "Unknown",
						exportName: "Unknown",
						importPath: "@nocoo/basalt/components/unknown",
						hasRootBarrel: false,
						kind: "catalog",
						category: "unknown" as never,
					},
				],
				docsBySlug: {},
				heroForSlug: () => undefined,
			}),
		).toThrow("Unknown catalog category: unknown");

		expect(() =>
			createCatalogIndex({
				entries: [
					{
						slug: "same",
						name: "First",
						exportName: "First",
						importPath: "@nocoo/basalt/components/first",
						hasRootBarrel: true,
						kind: "stable",
						category: "action",
					},
					{
						slug: "same",
						name: "Second",
						exportName: "Second",
						importPath: "@nocoo/basalt/charts/second",
						hasRootBarrel: false,
						kind: "catalog",
						category: "chart",
					},
				],
				docsBySlug: {},
				heroForSlug: () => undefined,
			}),
		).toThrow("Duplicate catalog slug: same");
	});

	it("normalizes whitespace, hyphens, and PascalCase for text search", () => {
		expect(normalizeCatalogSearchText("  SensitiveInput--FIELD\tValue ")).toBe(
			"sensitive input field value",
		);
		expect(normalizeCatalogSearchText("XMLHttpRequest")).toBe("xml http request");
		expect(
			filterCatalogIndexGroups(CATALOG_INDEX_GROUPS, { q: "SENSITIVE-input" }).flatMap(
				(group) => group.items,
			),
		).toHaveLength(1);
	});

	it("filters text tokens and enum dimensions with AND semantics", () => {
		const inputResults = filterCatalogIndexGroups(CATALOG_INDEX_GROUPS, { q: "input" });
		expect(inputResults.flatMap((group) => group.items)).toHaveLength(4);

		const catalogInputResults = filterCatalogIndexGroups(CATALOG_INDEX_GROUPS, {
			q: "input",
			release: "catalog",
			status: "ready",
		});
		expect(catalogInputResults.flatMap((group) => group.items)).toHaveLength(3);

		const plannedCharts = filterCatalogIndexGroups(CATALOG_INDEX_GROUPS, {
			category: "chart",
			status: "planned",
		});
		expect(plannedCharts).toHaveLength(1);
		expect(plannedCharts[0]?.label).toBe("Charts");
		expect(plannedCharts[0]?.items.map((item) => item.entry.slug)).toEqual(["maps"]);
		expect(
			filterCatalogIndexGroups(CATALOG_INDEX_GROUPS, { q: "input area" })[0]?.items,
		).toHaveLength(1);
	});

	it("preserves source order and omits empty groups", () => {
		const result = filterCatalogIndexGroups(CATALOG_INDEX_GROUPS, { release: "stable" });
		expect(result.map((group) => group.id)).toEqual(
			CATALOG_INDEX_GROUPS.filter((group) =>
				group.items.some((item) => item.releaseStatus === "stable"),
			).map((group) => group.id),
		);
		for (const group of result) {
			expect(group.items.map((item) => item.entry.slug)).toEqual(
				CATALOG.filter(
					(entry) => entry.category === group.id && catalogReleaseStatus(entry.kind) === "stable",
				).map((entry) => entry.slug),
			);
		}
		expect(result.flatMap((group) => group.items).some((item) => item.entry.slug === "text")).toBe(
			true,
		);
		expect(result.flatMap((group) => group.items).some((item) => item.entry.slug === "field")).toBe(
			true,
		);
		expect(CATALOG.filter((entry) => catalogReleaseStatus(entry.kind) === "stable")).toHaveLength(
			32,
		);
		expect(CATALOG.filter((entry) => catalogReleaseStatus(entry.kind) === "catalog")).toHaveLength(
			89,
		);
	});

	it("parses and normalizes catalog query values fail-closed", () => {
		expect(parseCatalogIndexQuery(new URLSearchParams())).toEqual(DEFAULT_CATALOG_INDEX_QUERY);
		expect(
			parseCatalogIndexQuery(
				new URLSearchParams("q=%20input%20%20group%20&category=chart&release=catalog&status=ready"),
			),
		).toEqual({ q: "input group", category: "chart", release: "catalog", status: "ready" });
		expect(
			normalizeCatalogIndexQuery({
				category: "other" as never,
				release: "preview" as never,
				status: "missing" as never,
			}),
		).toEqual(DEFAULT_CATALOG_INDEX_QUERY);
		expect(
			parseCatalogIndexQuery(
				new URLSearchParams("q=input&q=button&category=chart&category=chart&status=ready"),
			),
		).toEqual({ ...DEFAULT_CATALOG_INDEX_QUERY, status: "ready" });
	});

	it("serializes canonical owned keys while preserving foreign parameters", () => {
		const current = new URLSearchParams(
			"status=ready&foreign=one&q=old&q=duplicate&category=unknown&foreign=two",
		);
		expect(
			serializeCatalogIndexQuery(
				{ q: "  input   group ", category: "action", release: "catalog", status: "ready" },
				current,
			).toString(),
		).toBe("foreign=one&foreign=two&q=input+group&category=action&release=catalog&status=ready");
		expect(serializeCatalogIndexQuery(DEFAULT_CATALOG_INDEX_QUERY, current).toString()).toBe(
			"foreign=one&foreign=two",
		);
	});
});
