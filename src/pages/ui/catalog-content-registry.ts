import type { CatalogPageContent } from "./catalog-content";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

type CatalogContentFamilyRecord = Record<string, CatalogPageContent>;

const familyImporters = import.meta.glob<CatalogContentFamilyRecord>(
	"./catalog-content/families/*.tsx",
	{ import: "default" },
);

const familyLoaders = new Map(
	Object.entries(familyImporters).map(([modulePath, load]) => [familyIdFromPath(modulePath), load]),
);
const familyNames = [...new Set(Object.values(CATALOG_CONTENT_FAMILY))].sort();
const familyPromises = new Map<string, Promise<CatalogContentFamilyRecord>>();
let contentRecordPromise: Promise<Readonly<Record<string, CatalogPageContent>>> | undefined;

function familyIdFromPath(modulePath: string): string {
	const match = modulePath.match(/\/families\/([^/]+)\.tsx$/);
	if (!match?.[1]) {
		throw new Error(`Unknown catalog content family module "${modulePath}"`);
	}
	return match[1];
}

export function catalogContentFamilyNames(): readonly string[] {
	return familyNames;
}

export function loadCatalogContentFamily(family: string): Promise<CatalogContentFamilyRecord> {
	const cached = familyPromises.get(family);
	if (cached) {
		return cached;
	}
	const load = familyLoaders.get(family);
	if (!load) {
		throw new Error(`Unknown catalog content family "${family}"`);
	}
	const promise = load();
	familyPromises.set(family, promise);
	return promise;
}

export function loadCatalogContentRecord(): Promise<Readonly<Record<string, CatalogPageContent>>> {
	if (contentRecordPromise) {
		return contentRecordPromise;
	}
	contentRecordPromise = Promise.all(
		familyNames.map(async (family) => [family, await loadCatalogContentFamily(family)] as const),
	).then((loadedFamilies) => {
		const expectedOwners = CATALOG_CONTENT_FAMILY as Readonly<Record<string, string>>;
		const contentBySlug: Record<string, CatalogPageContent> = {};
		for (const [family, record] of loadedFamilies) {
			for (const [slug, content] of Object.entries(record)) {
				if (expectedOwners[slug] !== family) {
					throw new Error(`Unexpected catalog content owner "${slug}" in family "${family}"`);
				}
				contentBySlug[slug] = content;
			}
		}
		for (const slug of Object.keys(expectedOwners)) {
			if (!contentBySlug[slug]) {
				throw new Error(`Catalog content manifest owner "${slug}" did not load`);
			}
		}
		return contentBySlug;
	});
	return contentRecordPromise;
}
