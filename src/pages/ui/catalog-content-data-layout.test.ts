import { describe, expect, it } from "vitest";
import dataLayout from "./catalog-content/families/data-layout";
import { DATA_TABLE_EXAMPLES } from "./examples/data-table";
import { DELETE_RESOURCE_EXAMPLES } from "./examples/delete-resource";
import { FLOW_EXAMPLES } from "./examples/flow";
import { GRID_EXAMPLES } from "./examples/grid";
import { PAGE_HEADER_EXAMPLES } from "./examples/page-header";
import { RESOURCE_LIST_EXAMPLES } from "./examples/resource-list";
import { STAT_STRIP_EXAMPLES } from "./examples/stat-strip";
import { TABLE_EXAMPLES } from "./examples/table";
import { TABLE_PAGER_EXAMPLES } from "./examples/table-pager";
import { API as dataTableApi } from "./generated/catalog-api/data-table";
import { API as flowApi } from "./generated/catalog-api/flow";
import { API as gridApi } from "./generated/catalog-api/grid";
import { API as pageHeaderApi } from "./generated/catalog-api/page-header";
import { API as statStripApi } from "./generated/catalog-api/stat-strip";
import { API as tableApi } from "./generated/catalog-api/table";
import { API as tablePagerApi } from "./generated/catalog-api/table-pager";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const DATA_LAYOUT_SCENARIOS = {
	table: ["table-basic", "table-selected-row"],
	"data-table": [
		"data-table-default",
		"data-table-loading",
		"data-table-empty",
		"data-table-selection",
		"data-table-pagination",
		"data-table-filter",
	],
	grid: ["grid-grid"],
	flow: ["flow-sequential-flow"],
	"page-header": ["page-header-default", "page-header-long-responsive-content"],
	"stat-strip": ["stat-strip-overview", "stat-strip-loading-values"],
	"table-pager": ["table-pager-range-navigation", "table-pager-disabled-and-localized"],
	"resource-list": ["resource-list-default"],
	"delete-resource": ["delete-resource-default"],
} as const;

const DATA_LAYOUT_DESCRIPTIONS = {
	table: "Tabular data with a header bar and striped rows.",
	"data-table": "Sortable data table.",
	grid: "Simple grid.",
	flow: "Step flow.",
	"page-header":
		"A content page heading with optional description, eyebrow, breadcrumbs, and actions.",
} as const;

describe("data-layout catalog content family", () => {
	it("owns exactly nine slugs and ninety-one generated owners", () => {
		expect(Object.keys(dataLayout)).toEqual(Object.keys(DATA_LAYOUT_SCENARIOS));
		expect(Object.keys(dataLayout)).toHaveLength(9);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "data-layout")
				.map(([slug]) => slug)
				.sort(),
		).toEqual(Object.keys(DATA_LAYOUT_SCENARIOS).sort());
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(91);
	});

	it("keeps the eighteen final winner scenarios in their audited order", () => {
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
		expect(count).toBe(18);
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
			expect(docs?.implementationSource, slug).toEqual({
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: `packages/basalt/src/components/${slug}.tsx`,
			});
		}
		expect(dataLayout["data-table"]?.docs.api[0]?.props.map((prop) => prop.name)).toEqual([
			"data",
			"columns",
			"filter",
			"loading",
			"empty",
			"selected",
			"defaultSelected",
			"onSelectedChange",
			"multiple",
			"page",
			"defaultPage",
			"pageSize",
			"onPageChange",
			"getRowId",
			"className",
		]);
		expect(dataLayout.table?.examples).toBe(TABLE_EXAMPLES);
		expect(dataLayout.table?.docs.api).toBe(tableApi);
		expect(dataLayout["data-table"]?.examples).toBe(DATA_TABLE_EXAMPLES);
		expect(dataLayout["data-table"]?.docs.api).toBe(dataTableApi);
		expect(dataLayout.grid?.examples).toBe(GRID_EXAMPLES);
		expect(dataLayout.grid?.docs.api).toBe(gridApi);
		expect(dataLayout.flow?.examples).toBe(FLOW_EXAMPLES);
		expect(dataLayout.flow?.docs.api).toBe(flowApi);
		expect(dataLayout.table?.docs.usage).toContain("<TableHeader>");
		expect(dataLayout["page-header"]?.examples).toBe(PAGE_HEADER_EXAMPLES);
		expect(dataLayout["page-header"]?.docs.api).toBe(pageHeaderApi);
		expect(dataLayout["page-header"]?.docs.usage).toContain("<PageHeader");
		expect(dataLayout["page-header"]?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "page-header-default", title: "Default" },
			{ id: "page-header-long-responsive-content", title: "Long responsive content" },
		]);
		expect(dataLayout["stat-strip"]?.examples).toBe(STAT_STRIP_EXAMPLES);
		expect(dataLayout["stat-strip"]?.docs.api).toBe(statStripApi);
		expect(dataLayout["stat-strip"]?.docs).toMatchObject({
			description:
				"A responsive definition list of labelled values for page or dashboard overviews.",
			variants: [],
			provenance: {
				owner: "nocoo",
				repo: "ai-arsenal",
				ref: "78114d43df59",
				file: "src/components/ui/page-header.tsx",
			},
			implementationSource: {
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: "packages/basalt/src/components/stat-strip.tsx",
			},
		});
		expect(dataLayout["stat-strip"]?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "stat-strip-overview", title: "Overview" },
			{ id: "stat-strip-loading-values", title: "Loading values" },
		]);
		expect(dataLayout["table-pager"]?.examples).toBe(TABLE_PAGER_EXAMPLES);
		expect(dataLayout["table-pager"]?.docs.api).toBe(tablePagerApi);
		expect(dataLayout["table-pager"]?.docs).toMatchObject({
			description: "A table footer that pairs a result range with page controls.",
			variants: [],
			provenance: {
				owner: "nocoo",
				repo: "pika",
				ref: "d9b12caf26a4",
				file: "packages/web/src/components/ui/data-table-pagination.tsx",
			},
			implementationSource: {
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: "packages/basalt/src/components/table-pager.tsx",
			},
		});
		expect(dataLayout["table-pager"]?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "table-pager-range-navigation", title: "Range navigation" },
			{ id: "table-pager-disabled-and-localized", title: "Disabled and localized" },
		]);
		expect(dataLayout["resource-list"]?.examples).toBe(RESOURCE_LIST_EXAMPLES);
		expect(dataLayout["delete-resource"]?.examples).toBe(DELETE_RESOURCE_EXAMPLES);
	});
});
