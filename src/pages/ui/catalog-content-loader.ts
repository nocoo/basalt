import { type CatalogPageContent, requireCatalogPageContent } from "./catalog-content";
import { loadLegacyCatalogPageContent } from "./catalog-content-legacy";
import { catalogPageStatus } from "./catalog-page-status";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const familyImporters = import.meta.glob<Record<string, CatalogPageContent>>(
	"./catalog-content/families/*.tsx",
	{ import: "default" },
);

const familyPromises = new Map<string, Promise<Record<string, CatalogPageContent>>>();
const contentPromises = new Map<string, Promise<CatalogPageContent | undefined>>();

function familyIdFromPath(modulePath: string): string {
	const match = modulePath.match(/\/families\/([^/]+)\.tsx$/);
	if (!match?.[1]) {
		throw new Error(`Unknown catalog content family module "${modulePath}"`);
	}
	return match[1];
}

const familyLoaders = new Map(
	Object.entries(familyImporters).map(([modulePath, load]) => [familyIdFromPath(modulePath), load]),
);

function loadCatalogContentFamily(family: string): Promise<Record<string, CatalogPageContent>> {
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

interface TrackedPromise<T> extends Promise<T> {
	status?: "pending" | "fulfilled" | "rejected";
	value?: T;
	reason?: unknown;
}

function trackPromise<T>(promise: Promise<T>): TrackedPromise<T> {
	const tracked = promise as TrackedPromise<T>;
	tracked.status = "pending";
	promise.then(
		(value) => {
			tracked.status = "fulfilled";
			tracked.value = value;
		},
		(reason: unknown) => {
			tracked.status = "rejected";
			tracked.reason = reason;
		},
	);
	return tracked;
}

export function loadCatalogPageContent(slug: string): Promise<CatalogPageContent | undefined> {
	const cached = contentPromises.get(slug);
	if (cached) {
		return cached;
	}

	const promise = trackPromise(
		catalogPageStatus(slug) === "ready"
			? loadReadyCatalogPageContent(slug)
			: Promise.resolve(undefined),
	);
	contentPromises.set(slug, promise);
	return promise;
}

function loadReadyCatalogPageContent(slug: string): Promise<CatalogPageContent> {
	const family = CATALOG_CONTENT_FAMILY[slug as keyof typeof CATALOG_CONTENT_FAMILY];
	if (family) {
		return loadCatalogContentFamily(family).then((record) =>
			requireCatalogPageContent(slug, record[slug] ?? {}),
		);
	}
	return loadLegacyCatalogPageContent(slug).then((candidate) =>
		requireCatalogPageContent(slug, candidate),
	);
}
