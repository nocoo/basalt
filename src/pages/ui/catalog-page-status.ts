import { CATALOG_PAGE_STATUS } from "./generated/catalog-page-status";

export type CatalogPageStatus = "ready" | "planned";

export function catalogPageStatus(slug: string): CatalogPageStatus | undefined {
	return (CATALOG_PAGE_STATUS as Readonly<Record<string, CatalogPageStatus>>)[slug];
}
