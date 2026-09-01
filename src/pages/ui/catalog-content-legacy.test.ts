import { describe, expect, it } from "vitest";
import { loadLegacyCatalogPageContent } from "./catalog-content-legacy";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

describe("legacy catalog content adapter", () => {
	it("does not keep any of the eighty-four migrated ready owners", async () => {
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(84);
		for (const slug of Object.keys(CATALOG_CONTENT_FAMILY)) {
			const content = await loadLegacyCatalogPageContent(slug);
			expect(content.docs, slug).toBeUndefined();
			expect(content.examples, slug).toBeUndefined();
		}
	});

	it("leaves missing legacy values for the loader to reject", async () => {
		const content = await loadLegacyCatalogPageContent("maps");
		expect(content.docs).toBeUndefined();
		expect(content.examples).toBeUndefined();
	});
});
