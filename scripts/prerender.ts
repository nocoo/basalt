import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import english from "../src/i18n/locales/en.json";
import {
	applyCrawlPage,
	catalogCrawlPage,
	homeCrawlPage,
	showcaseCrawlPage,
	uiIndexCrawlPage,
} from "../src/lib/crawl";
import { SHOWCASE_PAGES } from "../src/lib/site";
import { CATALOG, catalogNavName } from "../src/pages/ui/catalog";

export function crawlPages() {
	return [
		homeCrawlPage(),
		uiIndexCrawlPage(CATALOG.map((entry) => ({ slug: entry.slug, name: catalogNavName(entry) }))),
		...SHOWCASE_PAGES.filter(
			(page) => page.inSitemap && page.path !== "/" && page.path !== "/ui",
		).map((page) =>
			showcaseCrawlPage(
				page.path,
				english.nav[page.titleKey.slice("nav.".length) as keyof typeof english.nav],
			),
		),
		...CATALOG.map((entry) => catalogCrawlPage(entry.slug, catalogNavName(entry))),
	];
}

export function fileForPath(distDir: string, pagePath: string): string {
	if (pagePath === "/") {
		return path.join(distDir, "index.html");
	}
	// Cloudflare's auto-trailing-slash mode serves route.html at /route, matching
	// our canonical URLs and Vite preview's extensionless HTML resolution.
	return path.join(distDir, `${pagePath.replace(/^\//, "")}.html`);
}

export function prerenderHtml(distDir: string, template: string): string[] {
	const written: string[] = [];
	for (const page of crawlPages()) {
		const filePath = fileForPath(distDir, page.path);
		mkdirSync(path.dirname(filePath), { recursive: true });
		writeFileSync(filePath, applyCrawlPage(template, page));
		written.push(filePath);
	}
	return written;
}
