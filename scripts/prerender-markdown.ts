import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createServer } from "vite";
import {
	buildMarkdownCatalog,
	type MarkdownCatalogRoute,
	type MarkdownGuideInfo,
	renderCategoryOverviewMarkdown,
	renderComponentMarkdown,
	renderHomeMarkdown,
	renderTemplateMarkdown,
	renderTemplatesIndexMarkdown,
	renderUiIndexMarkdown,
} from "../src/lib/catalog-markdown";
import { SITE, SITE_ORIGIN } from "../src/lib/site";
import { TEMPLATE_MANIFEST } from "../src/models/template-manifest";
import { normalizeConsumerTemplateSource } from "../src/models/templates";
import { CATALOG, catalogNavName } from "../src/pages/ui/catalog";
import { CATALOG_CATEGORIES } from "../src/pages/ui/catalog-categories";
import { CATALOG_COMPONENT_GUIDES } from "../src/pages/ui/catalog-guides";
import type { CatalogScenario } from "../src/pages/ui/catalog-scenario";
import type { CatalogDocs } from "../src/pages/ui/catalog-source";
import { loadCatalogFamilyRecords } from "./catalog-content-manifest";

export interface CatalogContentEntry {
	docs: CatalogDocs;
	examples: readonly CatalogScenario[];
}

export interface PrerenderMarkdownOptions {
	distDir: string;
	repoRoot: string;
	guides?: Readonly<Record<string, MarkdownGuideInfo>>;
	catalogContent?: Record<string, CatalogContentEntry>;
	origin?: string;
}

export async function loadCatalogContentForBuild(
	repoRoot: string,
): Promise<Record<string, CatalogContentEntry>> {
	const server = await createServer({
		root: repoRoot,
		configFile: path.join(repoRoot, "vite.config.ts"),
		server: { middlewareMode: true },
		appType: "custom",
		logLevel: "silent",
	});
	try {
		const families = await loadCatalogFamilyRecords(repoRoot, server);
		const result: Record<string, CatalogContentEntry> = {};
		for (const { family, record } of families) {
			for (const [slug, content] of Object.entries(record)) {
				if (result[slug]) {
					throw new Error(`Duplicate catalog content slug "${slug}" in ${family}`);
				}
				if (!content?.docs || !content?.examples) {
					throw new Error(`Catalog content family "${family}" is incomplete for "${slug}"`);
				}
				result[slug] = {
					docs: content.docs as CatalogDocs,
					examples: content.examples as readonly CatalogScenario[],
				};
			}
		}
		return result;
	} finally {
		await server.close();
	}
}

function writeMarkdownFile(distDir: string, relativePath: string, content: string): string {
	const filePath = path.join(distDir, relativePath);
	mkdirSync(path.dirname(filePath), { recursive: true });
	writeFileSync(filePath, `${content.trimEnd()}\n`, "utf8");
	return filePath;
}

export async function prerenderMarkdown(options: PrerenderMarkdownOptions): Promise<string[]> {
	const { distDir, repoRoot } = options;
	const baseOrigin = (options.origin ?? SITE_ORIGIN).replace(/\/+$/, "");
	const guides = options.guides ?? CATALOG_COMPONENT_GUIDES;
	const catalogContent = options.catalogContent ?? (await loadCatalogContentForBuild(repoRoot));

	const written: string[] = [];
	const routes: MarkdownCatalogRoute[] = [];

	written.push(writeMarkdownFile(distDir, "index.md", renderHomeMarkdown(baseOrigin)));
	routes.push({
		path: "/index.md",
		url: `${baseOrigin}/index.md`,
		kind: "home",
		title: SITE.homeTitle,
		description: SITE.description,
	});

	written.push(writeMarkdownFile(distDir, "ui.md", renderUiIndexMarkdown(guides, baseOrigin)));
	routes.push({
		path: "/ui.md",
		url: `${baseOrigin}/ui.md`,
		kind: "ui-index",
		title: "Basalt UI Components",
		description: `Browse all ${CATALOG.length} Basalt components, charts, providers, and blocks.`,
	});

	for (const category of CATALOG_CATEGORIES) {
		const relPath = `ui/overview/${category.id}.md`;
		written.push(
			writeMarkdownFile(distDir, relPath, renderCategoryOverviewMarkdown(category.id, baseOrigin)),
		);
		routes.push({
			path: `/${relPath}`,
			url: `${baseOrigin}/${relPath}`,
			kind: "category",
			title: category.label,
			description: category.description,
		});
	}

	for (const entry of CATALOG) {
		const content = catalogContent[entry.slug];
		if (!content) {
			throw new Error(`Missing catalog content for "${entry.slug}".`);
		}
		const relPath = `ui/${entry.slug}.md`;
		written.push(
			writeMarkdownFile(
				distDir,
				relPath,
				renderComponentMarkdown({
					entry,
					docs: content.docs,
					examples: content.examples,
					guide: guides[entry.slug],
					origin: baseOrigin,
				}),
			),
		);
		routes.push({
			path: `/${relPath}`,
			url: `${baseOrigin}/${relPath}`,
			kind: "component",
			title: catalogNavName(entry),
			description: content.docs.description,
		});
	}

	written.push(
		writeMarkdownFile(distDir, "templates.md", renderTemplatesIndexMarkdown(baseOrigin)),
	);
	routes.push({
		path: "/templates.md",
		url: `${baseOrigin}/templates.md`,
		kind: "templates-index",
		title: "Basalt Templates",
		description: `Browse all ${TEMPLATE_MANIFEST.length} full-page application templates built with @nocoo/basalt.`,
	});

	for (const template of TEMPLATE_MANIFEST) {
		const templateFile = path.join(repoRoot, "src/templates", template.fileName);
		const consumerSource = normalizeConsumerTemplateSource(readFileSync(templateFile, "utf8"));
		const relPath = `templates/${template.slug}.md`;
		written.push(
			writeMarkdownFile(
				distDir,
				relPath,
				renderTemplateMarkdown({
					template,
					consumerSource,
					origin: baseOrigin,
				}),
			),
		);
		routes.push({
			path: `/${relPath}`,
			url: `${baseOrigin}/${relPath}`,
			kind: "template",
			title: template.title,
			description: template.description,
		});
	}

	routes.push(
		{
			path: "/agents.md",
			url: `${baseOrigin}/agents.md`,
			kind: "agent-doc",
			title: "Basalt Agents Guide",
			description: "Agent rules, package entrypoints, and workflow guidelines for @nocoo/basalt.",
		},
		{
			path: "/setup.md",
			url: `${baseOrigin}/setup.md`,
			kind: "agent-doc",
			title: "Basalt Setup Guide",
			description: "Installation, CSS tokens, Tailwind v4, and provider setup for @nocoo/basalt.",
		},
	);

	written.push(
		writeMarkdownFile(
			distDir,
			"md-catalog.json",
			JSON.stringify(buildMarkdownCatalog(routes, baseOrigin), null, "\t"),
		),
	);

	return written;
}

function expectedMarkdownFiles(): string[] {
	return [
		"index.md",
		"ui.md",
		...CATALOG_CATEGORIES.map((category) => `ui/overview/${category.id}.md`),
		...CATALOG.map((entry) => `ui/${entry.slug}.md`),
		"templates.md",
		...TEMPLATE_MANIFEST.map((template) => `templates/${template.slug}.md`),
		"md-catalog.json",
	];
}

export function verifyMarkdownCoverage(distDir: string): void {
	const missingOrEmpty: string[] = [];
	for (const relPath of expectedMarkdownFiles()) {
		const fullPath = path.join(distDir, relPath);
		if (!existsSync(fullPath)) {
			missingOrEmpty.push(`${relPath} (missing)`);
			continue;
		}
		if (readFileSync(fullPath, "utf8").trim().length === 0) {
			missingOrEmpty.push(`${relPath} (empty)`);
		}
	}
	if (missingOrEmpty.length > 0) {
		throw new Error(
			`Markdown prerender coverage check failed:\n${missingOrEmpty.map((item) => `- ${item}`).join("\n")}`,
		);
	}
}
