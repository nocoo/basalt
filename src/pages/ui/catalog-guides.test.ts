import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { CATALOG_COMPONENT_GUIDES, getCatalogComponentGuide } from "./catalog-guides";
import { CATALOG_GUIDES_CORE } from "./catalog-guides-core";
import { CATALOG_GUIDES_EXTENDED } from "./catalog-guides-extended";

describe("catalog component guides", () => {
	it("covers every catalog slug with zero extras and disjoint core/extended sets", () => {
		const catalogSlugs = CATALOG.map((entry) => entry.slug);
		const coreSlugs = Object.keys(CATALOG_GUIDES_CORE);
		const extendedSlugs = Object.keys(CATALOG_GUIDES_EXTENDED);
		const mergedSlugs = Object.keys(CATALOG_COMPONENT_GUIDES);

		const extendedSlugSet = new Set(extendedSlugs);
		for (const slug of coreSlugs) {
			expect(extendedSlugSet.has(slug), `overlap on ${slug}`).toBe(false);
		}
		expect(mergedSlugs.length).toBe(coreSlugs.length + extendedSlugs.length);
		expect(new Set(mergedSlugs)).toEqual(new Set(catalogSlugs));
		expect(mergedSlugs).toHaveLength(81);
	});

	it("provides non-empty guidance and valid slug references for every entry", () => {
		const catalogSlugSet = new Set(CATALOG.map((entry) => entry.slug));

		for (const entry of CATALOG) {
			const guide = getCatalogComponentGuide(entry.slug);
			expect(guide, entry.slug).toBeDefined();
			expect(guide?.useWhen.trim().length, `${entry.slug} useWhen`).toBeGreaterThan(0);
			expect(guide?.avoidWhen.trim().length, `${entry.slug} avoidWhen`).toBeGreaterThan(0);
			expect(guide?.placement.trim().length, `${entry.slug} placement`).toBeGreaterThan(0);
			if (guide?.instead !== undefined) {
				expect(guide.instead.trim().length, `${entry.slug} instead`).toBeGreaterThan(0);
				if (/^[a-z0-9-]+$/.test(guide.instead)) {
					expect(catalogSlugSet.has(guide.instead), `${entry.slug} -> ${guide.instead}`).toBe(true);
				}
			}
		}

		expect(getCatalogComponentGuide("unknown-slug")).toBeUndefined();
		expect(getCatalogComponentGuide("toString")).toBeUndefined();
	});
});
