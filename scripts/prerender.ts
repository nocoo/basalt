import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
	applyCrawlPage,
	catalogCrawlPage,
	homeCrawlPage,
	uiIndexCrawlPage,
} from "../src/lib/crawl";
import { CATALOG, catalogNavName } from "../src/pages/ui/catalog";

export function crawlPages() {
	return [
		homeCrawlPage(),
		uiIndexCrawlPage(CATALOG.map((entry) => ({ slug: entry.slug, name: catalogNavName(entry) }))),
		...CATALOG.map((entry) => catalogCrawlPage(entry.slug, catalogNavName(entry))),
	];
}

export function fileForPath(distDir: string, pagePath: string): string {
	if (pagePath === "/") {
		return path.join(distDir, "index.html");
	}
	return path.join(distDir, pagePath.replace(/^\//, ""), "index.html");
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
