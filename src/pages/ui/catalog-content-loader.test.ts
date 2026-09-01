import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CATALOG } from "./catalog";
import type { CatalogPageContentCandidate } from "./catalog-content";
import { catalogPageStatus } from "./catalog-page-status";
import type { CatalogScenario } from "./catalog-scenario";
import type { CatalogDocs } from "./catalog-source";

const loadLegacy = vi.fn<(slug: string) => Promise<CatalogPageContentCandidate>>();

vi.mock("./catalog-content-legacy", () => ({
	loadLegacyCatalogPageContent: loadLegacy,
}));

const docs = { description: "Docs" } as CatalogDocs;
const example = { id: "button-default" } as CatalogScenario;

async function importLoader() {
	return import("./catalog-content-loader");
}

beforeEach(() => {
	vi.resetModules();
	loadLegacy.mockReset();
});

describe("catalog page content loader", () => {
	it("discovers families lazily without executing import promises at module init", () => {
		const source = readFileSync("src/pages/ui/catalog-content-loader.ts", "utf8");
		expect(source).toContain("import.meta.glob");
		expect(source).toContain('{ import: "default" }');
		expect(source).not.toMatch(/eager:\s*true/);
		expect(source).not.toMatch(/switch\s*\([^)]*family/);
	});

	it("uses the generated 84 ready / 12 planned status truth", () => {
		const statuses = CATALOG.map((entry) => catalogPageStatus(entry.slug));
		expect(statuses).toHaveLength(96);
		expect(statuses.filter((status) => status === "ready")).toHaveLength(84);
		expect(statuses.filter((status) => status === "planned")).toHaveLength(12);
	});

	it("does not call the heavy adapter for planned or missing slugs", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const planned = loadCatalogPageContent("maps");
		const missing = loadCatalogPageContent("not-a-control");
		expect(loadCatalogPageContent("maps")).toBe(planned);
		expect(loadCatalogPageContent("not-a-control")).toBe(missing);
		await expect(planned).resolves.toBeUndefined();
		await expect(missing).resolves.toBeUndefined();
		expect(loadLegacy).not.toHaveBeenCalled();
	});

	it("loads migrated ready content from the family without the legacy adapter", async () => {
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("button");
		expect(loadCatalogPageContent("button")).toBe(first);
		const content = await first;
		expect(content?.docs.description).toBe("Primary actions, including loading and icon slots.");
		expect(content?.examples[0]?.id).toBe("button-variants");
		expect(loadLegacy).not.toHaveBeenCalled();
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
		expect(loadLegacy).not.toHaveBeenCalled();
	});

	it("loads unmigrated ready content once from the legacy adapter", async () => {
		const examples = [example];
		loadLegacy.mockResolvedValue({ docs, examples });
		const { loadCatalogPageContent } = await importLoader();
		const first = loadCatalogPageContent("tooltip");
		expect(loadCatalogPageContent("tooltip")).toBe(first);
		await expect(first).resolves.toEqual({ docs, examples });
		expect(loadLegacy).toHaveBeenCalledTimes(1);
		expect(loadLegacy).toHaveBeenCalledWith("tooltip");
	});

	it("rejects ready content when docs or examples[0] is absent", async () => {
		loadLegacy.mockResolvedValueOnce({ examples: [example] }).mockResolvedValueOnce({ docs });
		const { loadCatalogPageContent } = await importLoader();
		await expect(loadCatalogPageContent("tooltip")).rejects.toThrow(
			'Ready catalog page "tooltip" is missing docs.',
		);
		await expect(loadCatalogPageContent("dialog")).rejects.toThrow(
			'Ready catalog page "dialog" is missing examples[0].',
		);
	});
});
