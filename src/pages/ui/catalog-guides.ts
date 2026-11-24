import { CATALOG_GUIDES_CORE, type CatalogComponentGuide } from "./catalog-guides-core";
import { CATALOG_GUIDES_EXTENDED } from "./catalog-guides-extended";

export type { CatalogComponentGuide } from "./catalog-guides-core";

export const CATALOG_COMPONENT_GUIDES: Readonly<Record<string, CatalogComponentGuide>> = {
	...CATALOG_GUIDES_CORE,
	...CATALOG_GUIDES_EXTENDED,
};

const CATALOG_GUIDE_MAP = new Map<string, CatalogComponentGuide>(
	Object.entries(CATALOG_COMPONENT_GUIDES),
);

export function getCatalogComponentGuide(slug: string): CatalogComponentGuide | undefined {
	return CATALOG_GUIDE_MAP.get(slug);
}
