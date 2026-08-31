import type { CatalogScenario } from "./catalog-scenario";
import type { CatalogDocs } from "./catalog-source";

export interface CatalogPageContent {
	docs: CatalogDocs;
	examples: readonly CatalogScenario[];
}

export interface CatalogPageContentCandidate {
	docs?: CatalogDocs;
	examples?: readonly CatalogScenario[];
}

export function requireCatalogPageContent(
	slug: string,
	candidate: CatalogPageContentCandidate,
): CatalogPageContent {
	if (!candidate.docs) {
		throw new Error(`Ready catalog page "${slug}" is missing docs.`);
	}
	if (!candidate.examples?.[0]) {
		throw new Error(`Ready catalog page "${slug}" is missing examples[0].`);
	}
	return {
		docs: candidate.docs,
		examples: candidate.examples,
	};
}
