import { EXTRA_DOCS } from "./catalog-ready";
import { type CatalogDocs, catalogDocsWithImplementation } from "./catalog-source";

export type { CatalogDocs };

export const CATALOG_DOCS: Record<string, CatalogDocs> = catalogDocsWithImplementation({
	...EXTRA_DOCS,
});
