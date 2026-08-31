import { describe, expect, it } from "vitest";
import { requireCatalogPageContent } from "./catalog-content";
import type { CatalogScenario } from "./catalog-scenario";
import type { CatalogDocs } from "./catalog-source";

const docs = { description: "Docs" } as CatalogDocs;
const example = { id: "button-default" } as CatalogScenario;

describe("catalog page content contract", () => {
	it("preserves the exact docs and examples owners", () => {
		const examples = [example];
		const content = requireCatalogPageContent("button", { docs, examples });
		expect(content.docs).toBe(docs);
		expect(content.examples).toBe(examples);
		expect(content.examples[0]).toBe(example);
	});

	it("fails ready content without docs", () => {
		expect(() => requireCatalogPageContent("button", { examples: [example] })).toThrow(
			'Ready catalog page "button" is missing docs.',
		);
	});

	it("fails ready content without examples[0]", () => {
		expect(() => requireCatalogPageContent("button", { docs, examples: [] })).toThrow(
			'Ready catalog page "button" is missing examples[0].',
		);
		expect(() => requireCatalogPageContent("button", { docs })).toThrow(
			'Ready catalog page "button" is missing examples[0].',
		);
	});
});
