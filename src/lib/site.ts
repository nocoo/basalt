import { SHOWCASE_ROUTES, SHOWCASE_TITLES, type ShowcaseRouteEntry } from "../models/navigation";
import { TEMPLATE_MANIFEST } from "../models/template-manifest";
import { CATALOG, CATALOG_BY_SLUG, catalogNavName } from "../pages/ui/catalog";
import {
	CATALOG_CATEGORIES,
	type CatalogCategory,
	catalogCategoryPath,
} from "../pages/ui/catalog-categories";
import { getCatalogComponentGuide } from "../pages/ui/catalog-guides";
import { SECURITY_HEADERS } from "./edge";

export const SITE_ORIGIN = "https://basaltui.com";

export const SITE = {
	name: "Basalt",
	title: "basalt.",
	homeTitle: "Basalt — React UI components & dashboard templates",
	ogTitle: "Basalt — React UI components & dashboard templates",
	description:
		"Build with Basalt: an open-source React UI library with matte components, charts, and dashboard templates. TypeScript, light and dark themes, MIT licensed.",
	image: {
		path: "/opengraph-image.png",
		type: "image/png",
		width: 1200,
		height: 630,
		alt: "basalt. Hanbaiyu marble Forbidden City corner tower on a pale engineering field.",
	},
	locale: "en_US",
	themeColorLight: "#f4f4f4",
	themeColorDark: "#171717",
	packageName: "@nocoo/basalt",
	github: "https://github.com/nocoo/basalt",
	npm: "https://www.npmjs.com/package/@nocoo/basalt",
	portfolio: "https://hexly.ai/",
	usageGuide: "ai/USAGE.md",
	integrationGuide: "ai/INTEGRATION.md",
	recipesGuide: "ai/RECIPES.md",
	registry: "ai/registry.json",
} as const;

export type ShowcaseCategory = CatalogCategory;

export type ShowcasePage = ShowcaseRouteEntry;

export interface CatalogLink {
	slug: string;
	name: string;
	category: ShowcaseCategory;
	importPath?: string;
	useWhen?: string;
}

export const SHOWCASE_PAGES: readonly ShowcasePage[] = SHOWCASE_ROUTES;

export { SHOWCASE_TITLES };

export const SHOWCASE_PATHS: readonly string[] = SHOWCASE_PAGES.filter(
	(page) => page.inSitemap,
).map((page) => page.path);

export function absoluteUrl(path = "/"): string {
	if (!path.startsWith("/")) {
		throw new Error(`Site path must be absolute, received "${path}"`);
	}
	if (path === "/") {
		return `${SITE_ORIGIN}/`;
	}
	return `${SITE_ORIGIN}${path}`;
}

export function canonicalUrl(pathname: string): string {
	if (pathname === "" || pathname === "/") {
		return absoluteUrl("/");
	}
	return absoluteUrl(pathname.replace(/\/+$/, ""));
}

export function documentTitle(pageName?: string): string {
	const name = pageName?.trim();
	if (!name || name === SITE.title) {
		return SITE.homeTitle;
	}
	return `${name} · ${SITE.title}`;
}

export function imageUrl(): string {
	return absoluteUrl(SITE.image.path);
}

export interface PageMetadata {
	path: string;
	title: string;
	description: string;
}

export function jsonLd(
	page: PageMetadata = { path: "/", title: SITE.homeTitle, description: SITE.description },
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": `${SITE_ORIGIN}/#website`,
				url: `${SITE_ORIGIN}/`,
				name: SITE.name,
				alternateName: SITE.title,
				description: SITE.description,
				inLanguage: "en",
				publisher: { "@id": `${SITE_ORIGIN}/#org` },
			},
			{
				"@type": "Organization",
				"@id": `${SITE_ORIGIN}/#org`,
				name: SITE.name,
				url: `${SITE_ORIGIN}/`,
				sameAs: [SITE.github, SITE.npm, SITE.portfolio],
			},
			{
				"@type": "SoftwareApplication",
				"@id": `${SITE_ORIGIN}/#software`,
				name: SITE.name,
				alternateName: SITE.packageName,
				applicationCategory: "DeveloperApplication",
				operatingSystem: "Web",
				url: `${SITE_ORIGIN}/`,
				downloadUrl: SITE.npm,
				codeRepository: SITE.github,
				image: imageUrl(),
				publisher: { "@id": `${SITE_ORIGIN}/#org` },
				offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
				isAccessibleForFree: true,
				description: SITE.description,
				license: `${SITE.github}/blob/main/LICENSE`,
			},
			{
				"@type": "WebPage",
				"@id": `${canonicalUrl(page.path)}#webpage`,
				url: canonicalUrl(page.path),
				name: page.title,
				description: page.description,
				isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
				about: { "@id": `${SITE_ORIGIN}/#software` },
				inLanguage: "en",
			},
		],
	};
}

export function jsonLdScript(page?: PageMetadata): string {
	return JSON.stringify(jsonLd(page)).replace(/</g, "\\u003c");
}

export function sitemapPaths(
	showcasePaths: readonly string[] = SHOWCASE_PATHS,
	catalogSlugs: readonly string[] = [],
): string[] {
	const paths = new Set<string>(showcasePaths);
	for (const slug of catalogSlugs) {
		paths.add(`/ui/${slug}`);
	}
	return [...paths].sort((a, b) => a.localeCompare(b));
}

export function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export function renderRobots(): string {
	return [
		"# Public catalog. Search engines and AI crawlers are welcome.",
		"# Machine-readable orientation: /llms.txt",
		"# AI crawler policy: /ai.txt",
		"",
		"User-agent: *",
		"Allow: /",
		"",
		`Sitemap: ${absoluteUrl("/sitemap.xml")}`,
		"",
	].join("\n");
}

export function renderSitemap(paths: readonly string[]): string {
	const urls = paths
		.map((path) => `  <url>\n    <loc>${escapeXml(canonicalUrl(path))}</loc>\n  </url>`)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderLlms(): string {
	return [
		`# ${SITE.name}`,
		"",
		`> ${SITE.description}`,
		"",
		`Basalt is the matte React design system \`${SITE.packageName}\` and its public catalog.`,
		"Public pages welcome search engines and AI crawlers. This file, the sitemap,",
		"the Markdown endpoints, and the catalog list do not require JavaScript.",
		"",
		"## Markdown Retrieval",
		"",
		"Fetch raw Markdown directly instead of scraping HTML:",
		`- Component pages: \`${absoluteUrl("/ui/<slug>.md")}\``,
		`- Category overviews: \`${absoluteUrl("/ui/overview/<category>.md")}\``,
		`- Application templates: \`${absoluteUrl("/templates/<slug>.md")}\``,
		`- [UI index (Markdown)](${absoluteUrl("/ui.md")}): All ${CATALOG.length} components grouped by category`,
		`- [Templates index (Markdown)](${absoluteUrl("/templates.md")}): All ${TEMPLATE_MANIFEST.length} page templates`,
		`- [Markdown route catalog](${absoluteUrl("/md-catalog.json")}): Machine-readable index of all Markdown routes`,
		"",
		"## Agent Entrypoints",
		"",
		`- [Agent rules snippet](${absoluteUrl("/agents.md")}): Drop-in \`<!-- basalt:start -->\` block for \`AGENTS.md\` / \`CLAUDE.md\``,
		`- [Setup playbook](${absoluteUrl("/setup.md")}): Step-by-step installation, CSS tokens, and provider setup`,
		`- [AI crawler policy](${absoluteUrl("/ai.txt")}): Permissions, attribution, and scope`,
		"",
		"## Catalog",
		"",
		`- [Design system catalog](${absoluteUrl("/ui")}): Components, charts and blocks`,
		`- [Full catalog list](${absoluteUrl("/llms-full.txt")}): One entry per published surface`,
		`- [Templates gallery](${absoluteUrl("/templates")}): Full-page application templates`,
		`- [App frame](${absoluteUrl("/layout")}): Shell, island and page heading recipe`,
		`- [Login](${absoluteUrl("/login")}): Full-viewport identity badge`,
		"",
		"## Package",
		"",
		`- npm: [${SITE.packageName}](${SITE.npm})`,
		`- Repository: [${SITE.github.replace("https://", "")}](${SITE.github})`,
		`- Agent usage guide (installed package): \`${SITE.usageGuide}\``,
		`- Application chrome: \`${SITE.integrationGuide}\``,
		`- Compilable recipes: \`${SITE.recipesGuide}\``,
		`- Machine registry: \`${SITE.registry}\``,
		"",
		"## Related",
		"",
		`- [Portfolio](${SITE.portfolio}): Other software projects`,
		"- [Play](https://lizheng.me/): Personal site",
		"- [Journal](https://lizheng.blog/): Essays",
		"- [Résumé](https://lizheng.dev/): Professional identity",
		"",
		"## Discovery",
		"",
		`- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
		`- [Crawler policy](${absoluteUrl("/robots.txt")})`,
		`- [AI crawler policy](${absoluteUrl("/ai.txt")})`,
		"",
	].join("\n");
}

export function renderLlmsFull(entries: readonly CatalogLink[]): string {
	const grouped = new Map<ShowcaseCategory, CatalogLink[]>(
		CATALOG_CATEGORIES.map((category) => [category.id, []]),
	);
	for (const entry of entries) {
		grouped.get(entry.category)?.push(entry);
	}
	const sections = CATALOG_CATEGORIES.map((category) => {
		const items = grouped.get(category.id) ?? [];
		const lines = items
			.slice()
			.sort((a, b) => a.name.localeCompare(b.name, "en"))
			.map((entry) => {
				const catalogEntry = CATALOG_BY_SLUG.get(entry.slug);
				const importPath = entry.importPath ?? catalogEntry?.importPath;
				const useWhen = entry.useWhen ?? getCatalogComponentGuide(entry.slug)?.useWhen;
				const meta = [
					`[Markdown](${absoluteUrl(`/ui/${entry.slug}.md`)})`,
					importPath ? `\`${importPath}\`` : null,
					useWhen,
				]
					.filter(Boolean)
					.join(" — ");
				return `- [${entry.name}](${absoluteUrl(`/ui/${entry.slug}`)}) (${meta})`;
			});
		const categoryPath = catalogCategoryPath(category.id);
		return `## ${category.label}\n\n[Overview](${absoluteUrl(categoryPath)}) ([Markdown](${absoluteUrl(`${categoryPath}.md`)})): ${category.description}\n\n${lines.join("\n")}`;
	});
	const templateLines = TEMPLATE_MANIFEST.map(
		(template) =>
			`- [${template.title}](${absoluteUrl(`/templates/${template.slug}.md`)}) ([View](${absoluteUrl(`/view/${template.slug}`)}) — ${template.description})`,
	);
	return [
		`# ${SITE.name} catalog`,
		"",
		`> ${SITE.description}`,
		"",
		`Install \`${SITE.packageName}\`. Browse the live catalog at ${absoluteUrl("/ui")}.`,
		"Each URL below is a public documentation surface with a matching `.md` endpoint.",
		"",
		...sections,
		"",
		"## Templates",
		"",
		`[Templates index](${absoluteUrl("/templates")}) ([Markdown](${absoluteUrl("/templates.md")})): Full-page application templates built with \`${SITE.packageName}\`.`,
		"",
		...templateLines,
		"",
		`See ${absoluteUrl("/llms.txt")} for package docs and crawler policy.`,
		"",
	].join("\n");
}

function formatMarkdownTable(
	headers: readonly string[],
	rows: readonly (readonly string[])[],
): string[] {
	const widths = headers.map((header, i) =>
		Math.max(3, header.length, ...rows.map((row) => row[i].length)),
	);
	const formatRow = (cells: readonly string[]) =>
		`| ${cells.map((cell, i) => cell.padEnd(widths[i])).join(" | ")} |`;
	const separator = `| ${widths.map((w) => "-".repeat(w)).join(" | ")} |`;
	return [formatRow(headers), separator, ...rows.map(formatRow)];
}

export function renderAgentsMd(): string {
	const componentRows = CATALOG.map((entry) => [
		catalogNavName(entry),
		`\`${entry.slug}\``,
		entry.category,
		`\`${entry.importPath}\``,
		entry.hasRootBarrel ? "`@nocoo/basalt`" : "subpath only",
		absoluteUrl(`/ui/${entry.slug}.md`),
	]);
	const templateRows = TEMPLATE_MANIFEST.map((template) => [
		template.title,
		`\`${template.slug}\``,
		template.category,
		absoluteUrl(`/templates/${template.slug}.md`),
	]);
	return [
		"<!-- basalt:start -->",
		`# ${SITE.name} Agent Instructions`,
		"",
		`Package: \`${SITE.packageName}\` · Catalog: ${SITE_ORIGIN} · Setup: ${absoluteUrl("/setup.md")}`,
		"",
		"## Retrieval-Over-Memory Rules",
		"",
		`- Fetch \`${absoluteUrl("/ui/<slug>.md")}\` or read \`node_modules/@nocoo/basalt/ai/registry.json\` before writing component props or signatures.`,
		`- Fetch \`${absoluteUrl("/ui/overview/<category>.md")}\` when choosing between components in a family.`,
		`- Fetch \`${absoluteUrl("/templates/<slug>.md")}\` for complete single-file page compositions.`,
		`- Fetch \`${absoluteUrl("/md-catalog.json")}\` to enumerate every Markdown documentation route.`,
		"",
		"## Design & Integration Invariants",
		"",
		"- **Matte layered surfaces (L0–L3)**: Step surface luminance via `--basalt-background` (L0), `ContentIsland` (L1), `LayerCard` (L2), and `LayerCard.Well` / recessed wells (L1/L3). Never use glassmorphism or `backdrop-blur`.",
		"- **Role-based spacing**: Control internals use `2/4/6/8px` (`--basalt-space-xs`..`lg`); cards and layout boundaries use `12/16/24/32px` (`--basalt-space-card-*` / `--basalt-space-layout-*`). Never enlarge control tokens.",
		'- **CSS contracts**: Use Tailwind v4 (`@import "@nocoo/basalt/styles"; @import "tailwindcss";`) or standalone CSS (`import "@nocoo/basalt/styles/standalone";`). Optional self-hosted fonts: `@nocoo/basalt/fonts.css`.',
		'- **Next.js App Router**: Keep interactive Basalt components in `"use client"` modules and adapt framework routing with `LinkProvider`.',
		"- **Notifications**: Mount one global `<Toaster />` at the application root (without an `id`) and trigger notifications via `toast()`.",
		"",
		`## Components (${CATALOG.length})`,
		"",
		...formatMarkdownTable(
			["Name", "Slug", "Category", "Import", "Root", "Markdown"],
			componentRows,
		),
		"",
		`## Templates (${TEMPLATE_MANIFEST.length})`,
		"",
		...formatMarkdownTable(["Title", "Slug", "Category", "Markdown"], templateRows),
		"<!-- basalt:end -->",
		"",
	].join("\n");
}

export function renderSetupMd(): string {
	return [
		`# ${SITE.name} Agent Setup Playbook`,
		"",
		`Install and configure \`${SITE.packageName}\` in a React 19 application.`,
		"",
		"## 1. Install Package",
		"",
		"```bash",
		`bun add ${SITE.packageName}`,
		`# or: npm install ${SITE.packageName}`,
		"```",
		"",
		"Requires `react` `^19` and `react-dom` `^19`. Built-in `DatePicker` and `DataTable` work standalone; install `recharts` only when rendering charts.",
		"",
		"## 2. Configure Stylesheet Contract",
		"",
		"### Option A: Tailwind CSS v4",
		"",
		"```css",
		'@import "@nocoo/basalt/styles";',
		'@import "tailwindcss";',
		"```",
		"",
		"### Option B: Standalone CSS (No Tailwind)",
		"",
		"```ts",
		'import "@nocoo/basalt/styles/standalone";',
		"```",
		"",
		"## 3. Optional Self-Hosted Fonts",
		"",
		"```ts",
		'import "@nocoo/basalt/fonts.css";',
		"```",
		"",
		"## 4. Mount Root Providers and Toaster",
		"",
		"Wrap the application root with `ThemeProvider`, optional `LinkProvider` (for React Router or Next.js `Link`), and a single `<Toaster />`.",
		'In Next.js, isolate interactive provider wrappers and Basalt client components inside `"use client"` modules.',
		"",
		"## 5. Persist Agent Rules",
		"",
		`Fetch ${absoluteUrl("/agents.md")} and append its \`<!-- basalt:start -->\` ... \`<!-- basalt:end -->\` block to your repository's \`AGENTS.md\` or \`CLAUDE.md\`.`,
		"",
		"## 6. Verify Typecheck and Build",
		"",
		"Run your project's TypeScript typecheck and production build to confirm imports, styles, and SSR/client boundaries compile cleanly.",
		"",
	].join("\n");
}

export function renderAiTxt(): string {
	return [
		`# ai.txt — AI Crawler & Agent Policy for ${SITE.name}`,
		`# Canonical URL: ${absoluteUrl("/ai.txt")}`,
		"",
		"User-Agent: *",
		"Allow: /",
		`Allow: ${absoluteUrl("/llms.txt")}`,
		`Allow: ${absoluteUrl("/llms-full.txt")}`,
		`Allow: ${absoluteUrl("/agents.md")}`,
		`Allow: ${absoluteUrl("/setup.md")}`,
		`Allow: ${absoluteUrl("/md-catalog.json")}`,
		"Allow: /ui/*.md",
		"Allow: /ui/overview/*.md",
		"Allow: /templates/*.md",
		"",
		"# Scope",
		`Scope: Public documentation, API references, and copyable templates at ${SITE_ORIGIN}/`,
		`Package: ${SITE.packageName} (MIT License)`,
		`Source: ${SITE.github}`,
		"",
		"# Attribution",
		`Attribution: ${SITE.name} (${SITE_ORIGIN})`,
		"",
		"# Restrictions",
		"# - Do not treat sample healthcare, finance, or telemetry mock data in the showcase as real user data.",
		"# - Do not redistribute Basalt brand marks (assets/brand/) as a third-party brand identity.",
		"# - Respect standard HTTP caching and reasonable crawl rates.",
		"",
	].join("\n");
}

export function renderHeaders(): string {
	const llms = absoluteUrl("/llms.txt");
	const markdownPaths = [
		"/agents.md",
		"/setup.md",
		"/index.md",
		"/ui.md",
		"/ui/*.md",
		"/ui/overview/*.md",
		"/templates.md",
		"/templates/*.md",
	];
	const markdownBlocks = markdownPaths.flatMap((path) => [
		path,
		"  Content-Type: text/markdown; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"  Access-Control-Allow-Origin: *",
		"",
	]);
	return [
		"# Production discovery headers. The Vite preview server is the only place that opts out of indexing.",
		"",
		"/llms.txt",
		"  Content-Type: text/plain; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"  Access-Control-Allow-Origin: *",
		"",
		"/llms-full.txt",
		"  Content-Type: text/plain; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"  Access-Control-Allow-Origin: *",
		"",
		"/ai.txt",
		"  Content-Type: text/plain; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"  Access-Control-Allow-Origin: *",
		"",
		"/md-catalog.json",
		"  Content-Type: application/json; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"  Access-Control-Allow-Origin: *",
		"",
		...markdownBlocks,
		"/robots.txt",
		"  Content-Type: text/plain; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"",
		"/sitemap.xml",
		"  Content-Type: application/xml; charset=utf-8",
		"",
		"/*",
		`  Link: <${llms}>; rel="service-doc"; type="text/plain"`,
		...Object.entries(SECURITY_HEADERS).map(([name, value]) => `  ${name}: ${value}`),
		"",
		"/opengraph-image.png",
		"  Cross-Origin-Resource-Policy: cross-origin",
		"",
		"/favicon.ico",
		"  Cross-Origin-Resource-Policy: cross-origin",
		"",
		"/favicon.png",
		"  Cross-Origin-Resource-Policy: cross-origin",
		"",
		"/apple-touch-icon.png",
		"  Cross-Origin-Resource-Policy: cross-origin",
		"",
		"/landing/*",
		"  Cross-Origin-Resource-Policy: cross-origin",
		"",
		"/fonts/*",
		"  Cross-Origin-Resource-Policy: cross-origin",
		"",
	].join("\n");
}

export function requiredIndexHtmlSnippets(): string[] {
	return [
		`<title>${escapeXml(SITE.homeTitle)}</title>`,
		'<meta name="color-scheme" content="light dark" />',
		'<meta name="text-scale" content="scale" />',
		`<meta name="description" content="${SITE.description}" />`,
		'<meta name="robots" content="index, follow, max-image-preview:large" />',
		`<meta name="theme-color" media="(prefers-color-scheme: light)" content="${SITE.themeColorLight}" />`,
		`<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${SITE.themeColorDark}" />`,
		`<link rel="canonical" href="${absoluteUrl("/")}" />`,
		`<link rel="alternate" type="text/plain" title="llms.txt" href="${absoluteUrl("/llms.txt")}" />`,
		`<meta property="og:title" content="${escapeXml(SITE.ogTitle)}" />`,
		`<meta property="og:description" content="${SITE.description}" />`,
		`<meta property="og:site_name" content="${SITE.name}" />`,
		`<meta property="og:locale" content="${SITE.locale}" />`,
		`<meta property="og:image" content="${imageUrl()}" />`,
		`<meta property="og:image:alt" content="${SITE.image.alt}" />`,
		`<meta name="twitter:title" content="${escapeXml(SITE.ogTitle)}" />`,
		`<meta name="twitter:image" content="${imageUrl()}" />`,
		jsonLdScript(),
	];
}
