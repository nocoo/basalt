import { CATALOG, type CatalogCategory, type CatalogEntry, type CatalogKind } from "./catalog";
import forms from "./catalog-content/families/forms";
import foundation from "./catalog-content/families/foundation";
import overlay from "./catalog-content/families/overlay";
import type { CatalogPageStatus } from "./catalog-page-status";
import type { CatalogScenario } from "./catalog-scenario";
import type { CatalogDocs } from "./catalog-source";
import { catalogHeroScenario } from "./demos";
import { CATALOG_DOCS } from "./docs";

const FAMILY_DOCS = Object.fromEntries(
	[...Object.entries(foundation), ...Object.entries(forms), ...Object.entries(overlay)].map(
		([slug, content]) => [slug, content.docs],
	),
);

function familyOrLegacyHero(slug: string): CatalogScenario | undefined {
	return (
		foundation[slug]?.examples[0] ??
		forms[slug]?.examples[0] ??
		overlay[slug]?.examples[0] ??
		catalogHeroScenario(slug)
	);
}

export type CatalogReleaseStatus = "stable" | "catalog";
export type { CatalogPageStatus } from "./catalog-page-status";
export type CatalogIndexCategory = "all" | Exclude<CatalogCategory, "docs">;
export type CatalogIndexRelease = "all" | CatalogReleaseStatus;
export type CatalogIndexStatus = "all" | CatalogPageStatus;

export interface CatalogIndexQuery {
	q: string;
	category: CatalogIndexCategory;
	release: CatalogIndexRelease;
	status: CatalogIndexStatus;
}

export const DEFAULT_CATALOG_INDEX_QUERY: CatalogIndexQuery = {
	q: "",
	category: "all",
	release: "all",
	status: "all",
};

export const CATALOG_INDEX_QUERY_KEYS = ["q", "category", "release", "status"] as const;

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

const CATEGORY_FILTERS = new Set<CatalogIndexCategory>(["all", "component", "chart", "block"]);
const RELEASE_FILTERS = new Set<CatalogIndexRelease>(["all", "stable", "catalog"]);
const STATUS_FILTERS = new Set<CatalogIndexStatus>(["all", "ready", "planned"]);
const OWNED_QUERY_KEYS = new Set<string>(CATALOG_INDEX_QUERY_KEYS);

function normalizedEnumValue<T extends string>(
	value: string | null | undefined,
	allowed: ReadonlySet<T>,
	fallback: T,
): T {
	return value && allowed.has(value as T) ? (value as T) : fallback;
}

function normalizeQueryValue(value: string | null | undefined): string {
	return value?.trim().replace(/\s+/g, " ") ?? "";
}

export function normalizeCatalogSearchText(value: string): string {
	return value
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
		.replace(/([a-z\d])([A-Z])/g, "$1 $2")
		.toLocaleLowerCase("en")
		.replace(/[\s-]+/g, " ")
		.trim();
}

export function normalizeCatalogIndexQuery(query: Partial<CatalogIndexQuery>): CatalogIndexQuery {
	return {
		q: normalizeQueryValue(query.q),
		category: normalizedEnumValue(
			query.category,
			CATEGORY_FILTERS,
			DEFAULT_CATALOG_INDEX_QUERY.category,
		),
		release: normalizedEnumValue(
			query.release,
			RELEASE_FILTERS,
			DEFAULT_CATALOG_INDEX_QUERY.release,
		),
		status: normalizedEnumValue(query.status, STATUS_FILTERS, DEFAULT_CATALOG_INDEX_QUERY.status),
	};
}

export function parseCatalogIndexQuery(searchParams: URLSearchParams): CatalogIndexQuery {
	const uniqueValue = (key: (typeof CATALOG_INDEX_QUERY_KEYS)[number]) => {
		const values = searchParams.getAll(key);
		return values.length === 1 ? values[0] : undefined;
	};
	return normalizeCatalogIndexQuery({
		q: uniqueValue("q"),
		category: uniqueValue("category") as CatalogIndexCategory | undefined,
		release: uniqueValue("release") as CatalogIndexRelease | undefined,
		status: uniqueValue("status") as CatalogIndexStatus | undefined,
	});
}

export function serializeCatalogIndexQuery(
	query: Partial<CatalogIndexQuery>,
	currentSearchParams: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
	const normalized = normalizeCatalogIndexQuery(query);
	const result = new URLSearchParams();
	for (const [key, value] of currentSearchParams) {
		if (!OWNED_QUERY_KEYS.has(key)) {
			result.append(key, value);
		}
	}
	if (normalized.q) {
		result.set("q", normalized.q);
	}
	if (normalized.category !== "all") {
		result.set("category", normalized.category);
	}
	if (normalized.release !== "all") {
		result.set("release", normalized.release);
	}
	if (normalized.status !== "all") {
		result.set("status", normalized.status);
	}
	return result;
}

export function filterCatalogIndexGroups(
	groups: readonly CatalogIndexGroup[],
	query: Partial<CatalogIndexQuery>,
): CatalogIndexGroup[] {
	const normalized = normalizeCatalogIndexQuery(query);
	const tokens = normalizeCatalogSearchText(normalized.q).split(" ").filter(Boolean);

	return groups.flatMap((group) => {
		if (normalized.category !== "all" && group.id !== normalized.category) {
			return [];
		}
		const items = group.items.filter((item) => {
			if (normalized.release !== "all" && item.releaseStatus !== normalized.release) {
				return false;
			}
			if (normalized.status !== "all" && item.pageStatus !== normalized.status) {
				return false;
			}
			const searchableText = normalizeCatalogSearchText(
				[item.entry.name, item.entry.navName, item.entry.slug].filter(Boolean).join(" "),
			);
			return tokens.every((token) => searchableText.includes(token));
		});
		return items.length > 0 ? [{ ...group, items }] : [];
	});
}

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
	docsBySlug: Partial<Record<string, CatalogDocs>> = { ...CATALOG_DOCS, ...FAMILY_DOCS },
	heroForSlug: (slug: string) => CatalogScenario | undefined = familyOrLegacyHero,
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
	docsBySlug: { ...CATALOG_DOCS, ...FAMILY_DOCS },
	heroForSlug: familyOrLegacyHero,
});

export const CATALOG_INDEX_ITEMS = CATALOG_INDEX_GROUPS.flatMap((group) => group.items);
export const CATALOG_INDEX_READY_COUNT = CATALOG_INDEX_ITEMS.filter(
	(item) => item.pageStatus === "ready",
).length;
