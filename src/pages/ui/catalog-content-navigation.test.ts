import { describe, expect, it } from "vitest";
import navigation from "./catalog-content/families/navigation";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const NAVIGATION_SCENARIOS = {
	"command-palette": ["command-palette-with-grouped-items", "command-palette-simple-flat-list"],
	tabs: ["tabs-variants", "tabs-many-tabs"],
	pagination: [
		"pagination-full-controls-default",
		"pagination-simple-controls",
		"pagination-mid-page-state",
	],
	breadcrumbs: ["breadcrumbs-basic", "breadcrumbs-loading"],
	"navigation-menu": ["navigation-menu-default"],
	"menu-bar": ["menu-bar-default"],
	toolbar: ["toolbar-input-shorthand", "toolbar-button-actions"],
	"table-of-contents": [
		"table-of-contents-options",
		"table-of-contents-no-active-item",
		"table-of-contents-without-title",
	],
	sidebar: ["sidebar-default"],
} as const;

const NAVIGATION_DESCRIPTIONS = {
	"command-palette": "Search pages and commands.",
	tabs: "Tabbed navigation.",
	pagination: "Page controls.",
	breadcrumbs: "Hierarchical location.",
	"navigation-menu": "Site navigation.",
	"menu-bar": "Desktop menu bar.",
	toolbar: "Compose explicit toolbar controls into one grouped card.",
	"table-of-contents": "On-this-page list.",
	sidebar: "App chrome: L0 sidebar with an L1 content island that floats a corner shadow.",
} as const;

describe("navigation catalog content family", () => {
	it("owns exactly nine migrated slugs and eighty-five generated owners", () => {
		expect(Object.keys(navigation)).toEqual(Object.keys(NAVIGATION_SCENARIOS));
		expect(Object.keys(navigation)).toHaveLength(9);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "navigation")
				.map(([slug]) => slug)
				.sort(),
		).toEqual(Object.keys(NAVIGATION_SCENARIOS).sort());
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(85);
	});

	it("keeps the seventeen final winner scenarios in their audited order", () => {
		let count = 0;
		for (const [slug, ids] of Object.entries(NAVIGATION_SCENARIOS)) {
			const examples = navigation[slug]?.examples ?? [];
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
		expect(count).toBe(17);
	});

	it("preserves every EXTRA docs field and implementation source", () => {
		for (const [slug, description] of Object.entries(NAVIGATION_DESCRIPTIONS)) {
			const docs = navigation[slug]?.docs;
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
		expect(navigation.pagination?.docs.api[0]?.props.map((prop) => prop.name)).toEqual([
			"page",
			"pageCount",
			"onPageChange",
			"simple",
		]);
	});
});
