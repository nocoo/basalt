import { type CatalogPageContent, requireCatalogPageContent } from "./catalog-content";
import { loadLegacyCatalogPageContent } from "./catalog-content-legacy";
import { catalogPageStatus } from "./catalog-page-status";

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
			? loadLegacyCatalogPageContent(slug).then((candidate) =>
					requireCatalogPageContent(slug, candidate),
				)
			: Promise.resolve(undefined),
	);
	contentPromises.set(slug, promise);
	return promise;
}
