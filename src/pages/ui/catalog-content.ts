import type { CatalogScenario } from "./catalog-scenario";
import {
	type CatalogDocs,
	type CatalogDocsDraft,
	catalogDocsWithImplementation,
} from "./catalog-source";

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

export function catalogContentFamily(
	drafts: Record<string, { docs: CatalogDocsDraft; examples: readonly CatalogScenario[] }>,
): Record<string, CatalogPageContent> {
	const docsBySlug = catalogDocsWithImplementation(
		Object.fromEntries(Object.entries(drafts).map(([slug, entry]) => [slug, entry.docs])),
	);
	return Object.fromEntries(
		Object.entries(drafts).map(([slug, entry]) => {
			const docs = docsBySlug[slug];
			if (!docs) {
				throw new Error(`Unknown catalog slug: ${slug}`);
			}
			return [slug, { docs, examples: entry.examples }];
		}),
	);
}
