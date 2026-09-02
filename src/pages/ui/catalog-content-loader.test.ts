import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CATALOG } from "./catalog";
import type { CatalogPageContent } from "./catalog-content";
import { catalogPageStatus } from "./catalog-page-status";

const loadFamily = vi.hoisted(() =>
	vi.fn<(family: string) => Promise<Record<string, CatalogPageContent>>>(),
);

vi.mock("./catalog-content-registry", async (importOriginal) => {
	const actual = await importOriginal<typeof import("./catalog-content-registry")>();
	loadFamily.mockImplementation(actual.loadCatalogContentFamily);
	return { ...actual, loadCatalogContentFamily: loadFamily };
});

async function importLoader() {
	return import("./catalog-content-loader");
}

beforeEach(() => {
	vi.resetModules();
	loadFamily.mockClear();
});

describe("catalog page content loader", () => {
	it("discovers families lazily without executing import promises at module init", () => {
		const source = readFileSync("src/pages/ui/catalog-content-registry.ts", "utf8");
		expect(source).toContain("import.meta.glob");
		expect(source).toContain('{ import: "default" }');
		expect(source).not.toMatch(/eager:\s*true/);
		expect(source).not.toMatch(/switch\s*\([^)]*family/);
		expect(source).not.toMatch(/const\s+\w+Promise\s*=\s*loadCatalogContentFamily/);
	});

	it("uses the generated 100 ready / 1 planned status truth", () => {
		const statuses = CATALOG.map((entry) => catalogPageStatus(entry.slug));
		expect(statuses).toHaveLength(101);
		expect(statuses.filter((status) => status === "ready")).toHaveLength(100);
		expect(statuses.filter((status) => status === "planned")).toHaveLength(1);
	});

	it("does not load a family for planned or missing slugs", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const planned = loadCatalogPageContent("maps");
		const missing = loadCatalogPageContent("not-a-control");
		expect(loadCatalogPageContent("maps")).toBe(planned);
		expect(loadCatalogPageContent("not-a-control")).toBe(missing);
		await expect(planned).resolves.toBeUndefined();
		await expect(missing).resolves.toBeUndefined();
		expect(loadFamily).not.toHaveBeenCalled();
	});

	it("loads foundation content from the generated family owner", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("button");
		expect(loadCatalogPageContent("button")).toBe(first);
		const content = await first;
		expect(content?.docs.description).toBe("Primary actions, including loading and icon slots.");
		expect(content?.examples[0]?.id).toBe("button-variants");
		expect(loadFamily).toHaveBeenCalledWith("foundation");
	});

	it("loads the ScrollArea owner from foundation", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const content = await loadCatalogPageContent("scroll-area");
		expect(content?.docs.api[0]?.name).toBe("ScrollArea");
		expect(content?.examples.map((example) => example.id)).toEqual([
			"scroll-area-vertical-list",
			"scroll-area-horizontal-row",
		]);
		expect(loadFamily).toHaveBeenCalledWith("foundation");
	});

	it("loads forms family content without the legacy adapter", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("input-group");
		expect(loadCatalogPageContent("input-group")).toBe(first);
		const content = await first;
		expect(content?.docs.description).toBe(
			"Compose an input with addons, an inline suffix, and status icons.",
		);
		expect(content?.examples[0]?.id).toBe("input-group-inline-suffix");
		expect(loadFamily).toHaveBeenCalledWith("forms");
	});

	it("loads the SegmentControl owner from forms", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const content = await loadCatalogPageContent("segment-control");
		expect(content?.docs.api[0]?.name).toBe("SegmentControl");
		expect(content?.examples.map((example) => example.id)).toEqual([
			"segment-control-controlled-status",
			"segment-control-overflow-disabled",
		]);
		expect(loadFamily).toHaveBeenCalledWith("forms");
	});

	it("loads the ConfirmDialog owner from overlay", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const content = await loadCatalogPageContent("confirm-dialog");
		expect(content?.docs.api.map((surface) => surface.name)).toEqual([
			"ConfirmDialog",
			"useConfirm",
		]);
		expect(content?.examples.map((example) => example.id)).toEqual([
			"confirm-dialog-controlled-async-loading",
			"confirm-dialog-promise-result",
		]);
		expect(loadFamily).toHaveBeenCalledWith("overlay");
	});

	it("loads overlay family content without the legacy adapter", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("dialog");
		expect(loadCatalogPageContent("dialog")).toBe(first);
		const content = await first;
		expect(content?.docs.description).toBe(
			"A window overlaid on the primary window, rendering the content underneath inert.",
		);
		expect(content?.examples[0]?.id).toBe("dialog-basic-dialog");
		expect(loadFamily).toHaveBeenCalledWith("overlay");
	});

	it("loads feedback family content without the legacy adapter", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("banner");
		expect(loadCatalogPageContent("banner")).toBe(first);
		const content = await first;
		expect(content?.docs.description).toBe(
			"Displays contextual inline messages for informational, alert, or error states.",
		);
		expect(content?.examples[0]?.id).toBe("banner-variants");
		expect(loadFamily).toHaveBeenCalledWith("feedback");
	});

	it("loads navigation family content without the legacy adapter", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("tabs");
		expect(loadCatalogPageContent("tabs")).toBe(first);
		const content = await first;
		expect(content?.docs.description).toBe("Tabbed navigation.");
		expect(content?.examples[0]?.id).toBe("tabs-variants");
		expect(loadFamily).toHaveBeenCalledWith("navigation");
	});

	it("loads the StatStrip owner from data-layout", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const content = await loadCatalogPageContent("stat-strip");
		expect(content?.docs.api[0]?.name).toBe("StatStrip");
		expect(content?.examples.map((example) => example.id)).toEqual([
			"stat-strip-overview",
			"stat-strip-loading-values",
		]);
		expect(loadFamily).toHaveBeenCalledWith("data-layout");
	});

	it("loads the TablePager owner from data-layout", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const content = await loadCatalogPageContent("table-pager");
		expect(content?.docs.api[0]?.name).toBe("TablePager");
		expect(content?.examples.map((example) => example.id)).toEqual([
			"table-pager-range-navigation",
			"table-pager-disabled-and-localized",
		]);
		expect(loadFamily).toHaveBeenCalledWith("data-layout");
	});

	it("loads data-layout family content without the legacy adapter", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("table");
		expect(loadCatalogPageContent("table")).toBe(first);
		const content = await first;
		expect(content?.docs.description).toBe("Tabular data with a header bar and striped rows.");
		expect(content?.examples[0]?.id).toBe("table-basic");
		expect(loadFamily).toHaveBeenCalledWith("data-layout");
	});

	it("loads charts family content without the legacy adapter", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("line");
		expect(loadCatalogPageContent("line")).toBe(first);
		const content = await first;
		expect(content?.docs.description).toBe("Line series.");
		expect(content?.examples[0]?.id).toBe("line-default");
		expect(loadFamily).toHaveBeenCalledWith("charts");
	});
});
