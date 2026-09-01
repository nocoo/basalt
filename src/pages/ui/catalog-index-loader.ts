import { CATALOG } from "./catalog";
import { loadCatalogContentRecord } from "./catalog-content-registry";
import { type CatalogIndexGroup, createCatalogIndex } from "./catalog-index";

export interface CatalogIndexData {
	groups: CatalogIndexGroup[];
	items: CatalogIndexGroup["items"];
	readyCount: number;
}

interface TrackedPromise<T> extends Promise<T> {
	status?: "pending" | "fulfilled" | "rejected";
	value?: T;
	reason?: unknown;
}

let catalogIndexPromise: TrackedPromise<CatalogIndexData> | undefined;

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

export function loadCatalogIndex(): TrackedPromise<CatalogIndexData> {
	if (catalogIndexPromise) {
		return catalogIndexPromise;
	}
	catalogIndexPromise = trackPromise(
		loadCatalogContentRecord().then((contentBySlug) => {
			const groups = createCatalogIndex({
				entries: CATALOG,
				docsBySlug: Object.fromEntries(
					Object.entries(contentBySlug).map(([slug, content]) => [slug, content.docs]),
				),
				heroForSlug: (slug) => contentBySlug[slug]?.examples[0],
			});
			const items = groups.flatMap((group) => group.items);
			return {
				groups,
				items,
				readyCount: items.filter((item) => item.pageStatus === "ready").length,
			};
		}),
	);
	return catalogIndexPromise;
}

export function readCatalogIndex(): CatalogIndexData {
	const promise = loadCatalogIndex();
	if (promise.status === "fulfilled" && promise.value) {
		return promise.value;
	}
	if (promise.status === "rejected") {
		throw promise.reason;
	}
	throw promise;
}
