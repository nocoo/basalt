import { CATALOG, type CatalogCategory, type CatalogEntry, type CatalogKind } from "./catalog";
import type { CatalogScenario } from "./catalog-scenario";
import type { CatalogDocs } from "./catalog-source";
import { catalogHeroScenario } from "./demos";
import { CATALOG_DOCS } from "./docs";

export type CatalogReleaseStatus = "stable" | "catalog";
export type CatalogPageStatus = "ready" | "planned";

export type CatalogPageState =
	| {
			pageStatus: "ready";
			docs: CatalogDocs;
			hero: CatalogScenario;
	  }
	| {
			pageStatus: "planned";
			docs?: CatalogDocs;
			hero?: CatalogScenario;
	  };

export type CatalogIndexItem = CatalogPageState & {
	entry: CatalogEntry;
	releaseStatus: CatalogReleaseStatus;
};

export interface CatalogIndexGroup {
	id: Exclude<CatalogCategory, "docs">;
	label: string;
	items: CatalogIndexItem[];
}

interface CatalogIndexSource {
	entries: readonly CatalogEntry[];
	docsBySlug: Partial<Record<string, CatalogDocs>>;
	heroForSlug: (slug: string) => CatalogScenario | undefined;
}

const INDEX_GROUPS: ReadonlyArray<Pick<CatalogIndexGroup, "id" | "label">> = [
	{ id: "component", label: "Components" },
	{ id: "chart", label: "Charts" },
	{ id: "block", label: "Blocks" },
];

const KNOWN_CATEGORIES = new Set<CatalogCategory>([
	"docs",
	...INDEX_GROUPS.map((group) => group.id),
]);

export function catalogReleaseStatus(kind: CatalogKind): CatalogReleaseStatus {
	switch (kind) {
		case "stable":
		case "provider":
			return "stable";
		case "catalog":
		case "chart":
			return "catalog";
		default:
			throw new Error(`Unknown catalog kind: ${String(kind)}`);
	}
}

export function resolveCatalogPageState(
	slug: string,
	docsBySlug: Partial<Record<string, CatalogDocs>> = CATALOG_DOCS,
	heroForSlug: (slug: string) => CatalogScenario | undefined = catalogHeroScenario,
): CatalogPageState {
	const docs = docsBySlug[slug];
	const hero = heroForSlug(slug);
	if (docs && hero) {
		return { pageStatus: "ready", docs, hero };
	}
	return { pageStatus: "planned", docs, hero };
}

export function createCatalogIndex({
	entries,
	docsBySlug,
	heroForSlug,
}: CatalogIndexSource): CatalogIndexGroup[] {
	const seenSlugs = new Set<string>();
	const itemsByCategory = new Map(
		INDEX_GROUPS.map((group) => [group.id, [] as CatalogIndexItem[]]),
	);

	for (const entry of entries) {
		if (seenSlugs.has(entry.slug)) {
			throw new Error(`Duplicate catalog slug: ${entry.slug}`);
		}
		seenSlugs.add(entry.slug);

		if (!KNOWN_CATEGORIES.has(entry.category)) {
			throw new Error(`Unknown catalog category: ${String(entry.category)}`);
		}

		const releaseStatus = catalogReleaseStatus(entry.kind);
		if (entry.category === "docs") {
			continue;
		}

		const categoryItems = itemsByCategory.get(entry.category);
		if (!categoryItems) {
			throw new Error(`Missing catalog index group: ${entry.category}`);
		}
		categoryItems.push({
			entry,
			releaseStatus,
			...resolveCatalogPageState(entry.slug, docsBySlug, heroForSlug),
		});
	}

	return INDEX_GROUPS.map((group) => {
		const items = itemsByCategory.get(group.id);
		if (!items) {
			throw new Error(`Missing catalog index group: ${group.id}`);
		}
		return { ...group, items };
	});
}

export const CATALOG_INDEX_GROUPS = createCatalogIndex({
	entries: CATALOG,
	docsBySlug: CATALOG_DOCS,
	heroForSlug: catalogHeroScenario,
});

export const CATALOG_INDEX_ITEMS = CATALOG_INDEX_GROUPS.flatMap((group) => group.items);
export const CATALOG_INDEX_READY_COUNT = CATALOG_INDEX_ITEMS.filter(
	(item) => item.pageStatus === "ready",
).length;
