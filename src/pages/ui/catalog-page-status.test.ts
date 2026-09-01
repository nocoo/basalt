import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { loadCatalogContentRecord } from "./catalog-content-registry";
import { resolveCatalogPageState } from "./catalog-index";
import { catalogPageStatus } from "./catalog-page-status";

describe("generated catalog page status", () => {
	it("matches the family-owned page resolver for all 97 catalog entries", async () => {
		const content = await loadCatalogContentRecord();
		const docs = Object.fromEntries(
			Object.entries(content).map(([slug, entry]) => [slug, entry.docs]),
		);
		const statuses = CATALOG.map((entry) => [entry.slug, catalogPageStatus(entry.slug)] as const);
		expect(statuses).toHaveLength(97);
		expect(statuses.filter(([, status]) => status === "ready")).toHaveLength(85);
		expect(statuses.filter(([, status]) => status === "planned")).toHaveLength(12);
		for (const [slug, status] of statuses) {
			expect(status, slug).toBe(
				resolveCatalogPageState(slug, docs, (key) => content[key]?.examples[0]).pageStatus,
			);
		}
		expect(catalogPageStatus("unknown")).toBeUndefined();
	});
});
