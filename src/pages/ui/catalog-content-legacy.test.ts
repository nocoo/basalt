import { describe, expect, it } from "vitest";
import { loadLegacyCatalogPageContent } from "./catalog-content-legacy";
import { UI_EXAMPLES } from "./demos";
import { CATALOG_DOCS } from "./docs";

describe("legacy catalog content adapter", () => {
	it("returns the existing docs and examples without changing their owners", async () => {
		const content = await loadLegacyCatalogPageContent("tooltip");
		expect(content.docs).toBe(CATALOG_DOCS.tooltip);
		expect(content.examples).toBe(UI_EXAMPLES.tooltip);
	});

	it("does not keep migrated foundation or forms owners", async () => {
		for (const slug of ["button", "field", "input", "input-group", "combobox", "toggle-group"]) {
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
