import type { CatalogPageContentCandidate } from "./catalog-content";

export async function loadLegacyCatalogPageContent(
	slug: string,
): Promise<CatalogPageContentCandidate> {
	const [{ CATALOG_DOCS }, { UI_EXAMPLES }] = await Promise.all([
		import("./docs"),
		import("./demos"),
	]);
	return {
		docs: CATALOG_DOCS[slug],
		examples: UI_EXAMPLES[slug],
	};
}
