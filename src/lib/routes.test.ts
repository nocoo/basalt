import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG_CATEGORIES, catalogCategoryPath } from "../pages/ui/catalog-categories";
import { CATALOG_PAGE_STATUS } from "../pages/ui/generated/catalog-page-status";
import { isKnownAppPath, normalizeAppPath, STANDALONE_EXAMPLE_PATHS } from "./routes";
import { SHOWCASE_PAGES } from "./site";

const slugs = Object.keys(CATALOG_PAGE_STATUS);

describe("known app paths", () => {
	it("covers every showcase page, example, category and catalog route", () => {
		const paths = [
			...SHOWCASE_PAGES.map((page) => page.path),
			...STANDALONE_EXAMPLE_PATHS,
			...CATALOG_CATEGORIES.map((category) => catalogCategoryPath(category.id)),
			...slugs.flatMap((slug) => [`/ui/${slug}`, `/ui/${slug}/source`]),
		];
		for (const path of paths) {
			expect(isKnownAppPath(path), path).toBe(true);
			expect(isKnownAppPath(`${path}/`), `${path}/`).toBe(true);
		}
	});

	it("matches every concrete route declared in the client router", () => {
		const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");
		const declared = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]);
		expect(declared.length).toBeGreaterThan(30);
		for (const path of declared) {
			if (path === "*") continue;
			const concrete = path
				.replace(":category", CATALOG_CATEGORIES[0].id)
				.replace(":slug", slugs[0]);
			expect(isKnownAppPath(concrete), path).toBe(true);
		}
	});

	it("rejects unknown pages, slugs and nesting", () => {
		for (const path of [
			"/nope",
			"/dashboard/extra",
			"/ui/not-a-component",
			"/ui/button/extra",
			"/ui/overview/not-a-category",
			"/examples",
			"/examples/unknown",
			"/ui/%E0%A4%A",
			"/wp-login.php",
		]) {
			expect(isKnownAppPath(path), path).toBe(false);
		}
	});

	it("drops a single trailing slash only", () => {
		expect(normalizeAppPath("/")).toBe("/");
		expect(normalizeAppPath("/ui/")).toBe("/ui");
		expect(normalizeAppPath("/ui")).toBe("/ui");
	});
});
