import { describe, expect, it } from "vitest";
import docs from "./catalog-content/families/docs";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const DOC_SLUGS = [
	"installation",
	"contributing",
	"colors",
	"accessibility",
	"figma",
	"cli",
	"skill",
	"registry",
	"changelog",
] as const;

describe("docs catalog content family", () => {
	it("owns the nine documentation slugs", () => {
		expect(Object.keys(docs)).toEqual([...DOC_SLUGS]);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "docs")
				.map(([slug]) => slug)
				.sort(),
		).toEqual([...DOC_SLUGS].sort());
	});

	it("points each page at a real repository file instead of a fake component path", () => {
		expect(docs.installation?.docs.implementationSource.file).toBe("packages/basalt/README.md");
		expect(docs.colors?.docs.implementationSource.file).toBe(
			"packages/basalt/src/styles/tokens.css",
		);
		expect(docs.accessibility?.docs.implementationSource.file).toBe(
			"packages/basalt/src/components/overlay.ts",
		);
		expect(docs.changelog?.docs.implementationSource.file).toBe("CHANGELOG.md");
		expect(docs.installation?.docs.usage).toContain("npm install @nocoo/basalt");
		expect(docs.installation?.docs.usage).not.toContain("@nocoo/basalt/components/installation");
		for (const slug of DOC_SLUGS) {
			const content = docs[slug];
			expect(content?.docs.api, slug).toEqual([]);
			expect(content?.examples[0]?.id.startsWith(`${slug}-`), slug).toBe(true);
			expect(content?.examples[0]?.render, slug).toBeTypeOf("function");
		}
	});
});
