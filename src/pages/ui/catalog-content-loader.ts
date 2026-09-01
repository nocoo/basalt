import { type CatalogPageContent, requireCatalogPageContent } from "./catalog-content";
import { loadCatalogContentFamily } from "./catalog-content-registry";
import { catalogPageStatus } from "./catalog-page-status";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const contentPromises = new Map<string, Promise<CatalogPageContent | undefined>>();

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
	if (!family) {
		return Promise.reject(new Error(`Ready catalog page "${slug}" has no content family.`));
	}
	return loadCatalogContentFamily(family).then((record) =>
		requireCatalogPageContent(slug, record[slug] ?? {}),
	);
}
