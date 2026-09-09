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
	themeColorLight: "#edeff2",
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

export type ShowcaseCategory = "component" | "chart" | "block";

export interface ShowcasePage {
	path: string;
	titleKey: string;
	inSitemap: boolean;
}

export interface CatalogLink {
	slug: string;
	name: string;
	category: ShowcaseCategory;
}

export const SHOWCASE_PAGES: readonly ShowcasePage[] = [
	{ path: "/", titleKey: "nav.home", inSitemap: true },
	{ path: "/dashboard", titleKey: "nav.dashboard", inSitemap: true },
	{ path: "/ui", titleKey: "nav.kitIndex", inSitemap: true },
	{ path: "/login", titleKey: "nav.login", inSitemap: true },
	{ path: "/layout", titleKey: "nav.layout", inSitemap: true },
	{ path: "/palette", titleKey: "nav.colorPalette", inSitemap: true },
	{ path: "/components", titleKey: "nav.components", inSitemap: true },
	{ path: "/forms", titleKey: "nav.forms", inSitemap: true },
	{ path: "/navigation", titleKey: "nav.navigation", inSitemap: true },
	{ path: "/interactive", titleKey: "nav.interactive", inSitemap: true },
	{ path: "/data", titleKey: "nav.data", inSitemap: true },
	{ path: "/accounts", titleKey: "nav.accounts", inSitemap: true },
	{ path: "/progress-tracking", titleKey: "nav.progressTracking", inSitemap: true },
	{ path: "/flow-comparison", titleKey: "nav.flowComparison", inSitemap: true },
	{ path: "/portfolio", titleKey: "nav.portfolio", inSitemap: true },
	{ path: "/loading-states", titleKey: "nav.loadingStates", inSitemap: true },
	{ path: "/animation", titleKey: "nav.animation", inSitemap: true },
	{ path: "/tables", titleKey: "nav.tables", inSitemap: true },
	{ path: "/dialogs", titleKey: "nav.dialogs", inSitemap: true },
	{ path: "/chat", titleKey: "nav.chat", inSitemap: true },
	{ path: "/settings", titleKey: "nav.settings", inSitemap: true },
	{ path: "/interactions", titleKey: "nav.interactions", inSitemap: true },
	{ path: "/health", titleKey: "nav.health", inSitemap: true },
	{ path: "/wearable", titleKey: "nav.wearableHealth", inSitemap: true },
	{ path: "/banking", titleKey: "nav.bankingWealth", inSitemap: true },
	{ path: "/network", titleKey: "nav.networkOps", inSitemap: true },
	{ path: "/static-page", titleKey: "nav.staticPage", inSitemap: true },
	{ path: "/loading", titleKey: "nav.loading", inSitemap: false },
	{ path: "/404", titleKey: "nav.notFoundPage", inSitemap: false },
];

export const SHOWCASE_TITLE_KEYS: Readonly<Record<string, string>> = Object.fromEntries(
	SHOWCASE_PAGES.map((page) => [page.path, page.titleKey]),
);

export const SHOWCASE_PATHS: readonly string[] = SHOWCASE_PAGES.filter(
	(page) => page.inSitemap,
).map((page) => page.path);

const CATEGORY_HEADINGS: Record<ShowcaseCategory, string> = {
	component: "Components",
	chart: "Charts",
	block: "Blocks",
};

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
		"and the catalog list do not require JavaScript.",
		"",
		"## Catalog",
		"",
		`- [Design system catalog](${absoluteUrl("/ui")}): Components, charts and blocks`,
		`- [Full catalog list](${absoluteUrl("/llms-full.txt")}): One entry per published surface`,
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
		"",
	].join("\n");
}

export function renderLlmsFull(entries: readonly CatalogLink[]): string {
	const grouped = new Map<ShowcaseCategory, CatalogLink[]>([
		["component", []],
		["chart", []],
		["block", []],
	]);
	for (const entry of entries) {
		grouped.get(entry.category)?.push(entry);
	}
	const sections = [...grouped.entries()].map(([category, items]) => {
		const lines = items
			.slice()
			.sort((a, b) => a.name.localeCompare(b.name, "en"))
			.map((entry) => `- [${entry.name}](${absoluteUrl(`/ui/${entry.slug}`)})`);
		return `## ${CATEGORY_HEADINGS[category]}\n\n${lines.join("\n")}`;
	});
	return [
		`# ${SITE.name} catalog`,
		"",
		`> ${SITE.description}`,
		"",
		`Install \`${SITE.packageName}\`. Browse the live catalog at ${absoluteUrl("/ui")}.`,
		"Each URL below is a public documentation surface.",
		"",
		...sections,
		"",
		`See ${absoluteUrl("/llms.txt")} for package docs and crawler policy.`,
		"",
	].join("\n");
}

export function renderHeaders(): string {
	const llms = absoluteUrl("/llms.txt");
	return [
		"# Production discovery headers. The Vite preview server is the only place that opts out of indexing.",
		"",
		"/llms.txt",
		"  Content-Type: text/plain; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"",
		"/llms-full.txt",
		"  Content-Type: text/plain; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"",
		"/robots.txt",
		"  Content-Type: text/plain; charset=utf-8",
		"  X-Content-Type-Options: nosniff",
		"",
		"/sitemap.xml",
		"  Content-Type: application/xml; charset=utf-8",
		"",
		"/*",
		`  Link: <${llms}>; rel="service-doc"; type="text/plain"`,
		"  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
		"  X-Content-Type-Options: nosniff",
		"  X-Frame-Options: SAMEORIGIN",
		"  Referrer-Policy: strict-origin-when-cross-origin",
		"",
	].join("\n");
}

export function previewRobotTag(): string {
	return "noindex";
}

export function serviceDocLink(origin = SITE_ORIGIN): string {
	return `<${origin}/llms.txt>; rel="service-doc"; type="text/plain"`;
}

export function requiredIndexHtmlSnippets(): string[] {
	return [
		`<title>${escapeXml(SITE.homeTitle)}</title>`,
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
