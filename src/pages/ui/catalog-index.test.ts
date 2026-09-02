import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
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
	it("groups every non-doc catalog entry exactly once", () => {
		expect(loadCatalogIndex()).toBe(loadCatalogIndex());
		expect(CATALOG_INDEX_GROUPS.map((group) => group.label)).toEqual([
			"Components",
			"Charts",
			"Blocks",
		]);
		expect(CATALOG_INDEX_GROUPS.map((group) => group.items.length)).toEqual([65, 24, 3]);
		expect(CATALOG_INDEX_ITEMS).toHaveLength(92);

		const slugs = CATALOG_INDEX_ITEMS.map((item) => item.entry.slug);
		expect(new Set(slugs).size).toBe(92);
		expect(slugs).toEqual(
			CATALOG.filter((entry) => entry.category !== "docs").map((entry) => entry.slug),
		);
	});

	it("models the current page and release states independently", () => {
		expect(CATALOG_INDEX_READY_COUNT).toBe(91);
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

	it("models all public catalog navigation as 91 ready and 10 planned pages", () => {
		const states = CATALOG.map((entry) => ({
			slug: entry.slug,
			pageStatus: resolveCatalogPageState(entry.slug, catalogDocs, catalogHero).pageStatus,
		}));
		expect(states.filter((item) => item.pageStatus === "ready")).toHaveLength(91);
		expect(states.filter((item) => item.pageStatus === "planned").map((item) => item.slug)).toEqual(
			[
				"installation",
				"contributing",
				"colors",
				"accessibility",
				"figma",
				"cli",
				"skill",
				"registry",
				"changelog",
				"maps",
			],
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
		expect(result.map((group) => group.id)).toEqual(["component"]);
		expect(result[0]?.items.map((item) => item.entry.slug)).toEqual(
			CATALOG_INDEX_GROUPS[0]?.items
				.filter((item) => item.releaseStatus === "stable")
				.map((item) => item.entry.slug),
		);
		expect(result[0]?.items.some((item) => item.entry.slug === "text")).toBe(true);
		expect(result[0]?.items.some((item) => item.entry.slug === "field")).toBe(true);
		expect(CATALOG.filter((entry) => catalogReleaseStatus(entry.kind) === "stable")).toHaveLength(
			32,
		);
		expect(CATALOG.filter((entry) => catalogReleaseStatus(entry.kind) === "catalog")).toHaveLength(
			69,
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
				{ q: "  input   group ", category: "component", release: "catalog", status: "ready" },
				current,
			).toString(),
		).toBe("foreign=one&foreign=two&q=input+group&category=component&release=catalog&status=ready");
		expect(serializeCatalogIndexQuery(DEFAULT_CATALOG_INDEX_QUERY, current).toString()).toBe(
			"foreign=one&foreign=two",
		);
	});
});
