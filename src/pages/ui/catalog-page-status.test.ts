import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { resolveCatalogPageState } from "./catalog-index";
import { catalogPageStatus } from "./catalog-page-status";

describe("generated catalog page status", () => {
	it("matches the heavy page resolver for all 96 catalog entries", () => {
		const statuses = CATALOG.map((entry) => [entry.slug, catalogPageStatus(entry.slug)] as const);
		expect(statuses).toHaveLength(96);
		expect(statuses.filter(([, status]) => status === "ready")).toHaveLength(84);
		expect(statuses.filter(([, status]) => status === "planned")).toHaveLength(12);
		for (const [slug, status] of statuses) {
			expect(status, slug).toBe(resolveCatalogPageState(slug).pageStatus);
		}
		expect(catalogPageStatus("unknown")).toBeUndefined();
	});
});
