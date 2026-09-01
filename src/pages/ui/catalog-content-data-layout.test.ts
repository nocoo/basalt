import { describe, expect, it } from "vitest";
import dataLayout from "./catalog-content/families/data-layout";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const DATA_LAYOUT_SCENARIOS = {
	table: ["table-basic", "table-selected-row"],
	"data-table": ["data-table-default"],
	grid: ["grid-grid"],
	flow: ["flow-sequential-flow"],
	"page-header": ["page-header-default"],
} as const;

const DATA_LAYOUT_DESCRIPTIONS = {
	table: "Tabular data with a header bar and striped rows.",
	"data-table": "Sortable data table.",
	grid: "Simple grid.",
	flow: "Step flow.",
	"page-header": "App header with breadcrumbs and title.",
} as const;

describe("data-layout catalog content family", () => {
	it("owns exactly five migrated slugs and eighty-five generated owners", () => {
		expect(Object.keys(dataLayout)).toEqual(Object.keys(DATA_LAYOUT_SCENARIOS));
		expect(Object.keys(dataLayout)).toHaveLength(5);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "data-layout")
				.map(([slug]) => slug)
				.sort(),
		).toEqual(Object.keys(DATA_LAYOUT_SCENARIOS).sort());
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(85);
	});

	it("keeps the six final winner scenarios in their audited order", () => {
		let count = 0;
		for (const [slug, ids] of Object.entries(DATA_LAYOUT_SCENARIOS)) {
			const examples = dataLayout[slug]?.examples ?? [];
			expect(
				examples.map((example) => example.id),
				slug,
			).toEqual(ids);
			expect(
				examples.every(
					(example) =>
						example.title.length > 0 &&
						example.code.length > 0 &&
						typeof example.render === "function",
				),
				slug,
			).toBe(true);
			count += examples.length;
		}
		expect(count).toBe(6);
	});

	it("preserves every EXTRA docs field and implementation source", () => {
		for (const [slug, description] of Object.entries(DATA_LAYOUT_DESCRIPTIONS)) {
			const docs = dataLayout[slug]?.docs;
			expect(docs?.description, slug).toBe(description);
			expect(docs?.usage.length, slug).toBeGreaterThan(0);
			expect(docs?.variants, slug).toEqual([]);
			expect(docs?.api[0]?.props, slug).toBeDefined();
			expect(docs?.provenance, slug).toEqual({
				owner: "nocoo",
				repo: "pew",
				ref: "97a890fabe6e",
				file: "packages/web/src/components",
			});
			const implementationSlug = slug === "page-header" ? "app-header" : slug;
			expect(docs?.implementationSource, slug).toEqual({
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: `packages/basalt/src/components/${implementationSlug}.tsx`,
			});
		}
		expect(dataLayout["data-table"]?.docs.api[0]?.props.map((prop) => prop.name)).toEqual([
			"data",
			"columns",
			"filter",
		]);
		expect(dataLayout.table?.docs.usage).toContain("<TableHeader>");
		expect(dataLayout["page-header"]?.docs.usage).toContain("<AppHeader");
	});
});
