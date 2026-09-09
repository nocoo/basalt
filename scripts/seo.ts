import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { applyLandingToIndexHtml, requiredLandingSnippets } from "../src/lib/landing-document";
import {
	type CatalogLink,
	renderHeaders,
	renderLlms,
	renderLlmsFull,
	renderRobots,
	renderSitemap,
	requiredIndexHtmlSnippets,
	SHOWCASE_PATHS,
	sitemapPaths,
} from "../src/lib/site";
import { CATALOG, catalogNavName } from "../src/pages/ui/catalog";

export const GENERATE_COMMAND = "bun run seo:generate";

export const SEO_FILES = [
	"public/robots.txt",
	"public/sitemap.xml",
	"public/llms.txt",
	"public/llms-full.txt",
	"public/_headers",
] as const;

function catalogLinks(): CatalogLink[] {
	return CATALOG.map((entry) => ({
		slug: entry.slug,
		name: catalogNavName(entry),
		category: entry.category,
	}));
}

export function renderSeoFiles(): Record<(typeof SEO_FILES)[number], string> {
	const links = catalogLinks();
	return {
		"public/robots.txt": renderRobots(),
		"public/sitemap.xml": renderSitemap(
			sitemapPaths(
				SHOWCASE_PATHS,
				links.map((entry) => entry.slug),
			),
		),
		"public/llms.txt": renderLlms(),
		"public/llms-full.txt": renderLlmsFull(links),
		"public/_headers": renderHeaders(),
	};
}

export function writeSeoFiles(repoRoot: string): void {
	const files = renderSeoFiles();
	for (const [relative, content] of Object.entries(files)) {
		const filePath = path.join(repoRoot, relative);
		mkdirSync(path.dirname(filePath), { recursive: true });
		writeFileSync(filePath, content);
	}
	const indexPath = path.join(repoRoot, "index.html");
	writeFileSync(indexPath, applyLandingToIndexHtml(readFileSync(indexPath, "utf8")));
}

export function checkSeoFiles(repoRoot: string): void {
	const files = renderSeoFiles();
	const mismatches: string[] = [];
	for (const [relative, expected] of Object.entries(files)) {
		const filePath = path.join(repoRoot, relative);
		const actual = readFileSync(filePath, "utf8");
		if (actual !== expected) {
			mismatches.push(relative);
		}
	}
	const html = readFileSync(path.join(repoRoot, "index.html"), "utf8");
	for (const snippet of [...requiredIndexHtmlSnippets(), ...requiredLandingSnippets()]) {
		if (!html.includes(snippet)) {
			mismatches.push(`index.html missing ${snippet.slice(0, 48)}`);
		}
	}
	if (html !== applyLandingToIndexHtml(html)) {
		mismatches.push("index.html generated content or metadata");
	}
	if (mismatches.length > 0) {
		throw new Error(`SEO files are stale (${mismatches.join(", ")}). Run ${GENERATE_COMMAND}.`);
	}
}
