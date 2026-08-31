import { describe, expect, it } from "vitest";
import { loadLegacyCatalogPageContent } from "./catalog-content-legacy";
import { UI_EXAMPLES } from "./demos";
import { CATALOG_DOCS } from "./docs";

describe("legacy catalog content adapter", () => {
	it("returns the existing docs and examples without changing their owners", async () => {
		const content = await loadLegacyCatalogPageContent("button");
		expect(content.docs).toBe(CATALOG_DOCS.button);
		expect(content.examples).toBe(UI_EXAMPLES.button);
	});

	it("leaves missing legacy values for the loader to reject", async () => {
		const content = await loadLegacyCatalogPageContent("maps");
		expect(content.docs).toBeUndefined();
		expect(content.examples).toBeUndefined();
	});
});
