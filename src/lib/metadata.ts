import { TEMPLATE_MANIFEST } from "../models/template-manifest";
import { getTemplateByManifestSlug } from "../models/templates";
import { catalogCategory } from "../pages/ui/catalog-categories";
import {
	canonicalUrl,
	documentTitle,
	escapeXml,
	jsonLdScript,
	type PageMetadata,
	SITE,
} from "./site";

const PAGE_DESCRIPTIONS: Readonly<Record<string, string>> = {
	"/ui":
		"Explore Basalt React components, charts, and reusable blocks. Browse live examples, TypeScript APIs, and source code for your next application.",
	"/dashboard":
		"An analytics overview template with KPI stat cards, sparklines, bar charts, radial gauges, and recent activity built with @nocoo/basalt.",
	"/banking":
		"A finance and wealth dashboard template with balances, asset allocation, funding flows, and transfer history built with @nocoo/basalt.",
	"/network":
		"A network operations dashboard template for latency trends, traffic topology, service health, and incident timelines built with @nocoo/basalt.",
	"/health":
		"A health telemetry dashboard template with daily slot bars, activity heatmap, trends, and timeline views built with @nocoo/basalt.",
	"/layout":
		"Build a responsive React application shell with Basalt: sidebar navigation, a header, scrollable content, page headings, and layered surfaces.",
	"/palette":
		"Explore the Basalt design system color palette. Customize accent colors, chart palettes, and matte surfaces across light and dark themes.",
	"/typeface":
		"Explore the Basalt typography system: Inter and JetBrains Mono across the 7-tier positional type scale, integer line boxes, OpenType features, and tabular numerals.",
};

const TEMPLATE_DESCRIPTIONS: Readonly<Record<string, string>> = Object.fromEntries(
	TEMPLATE_MANIFEST.map((template) => [
		`/templates/${template.slug}`,
		`${template.description} Preview responsive widths, inspect template anatomy, and copy standalone React source.`,
	]),
);

export function pageMetadata(pathname: string, pageName?: string): PageMetadata {
	const path = pathname.replace(/\/+$/, "") || "/";
	const title = path === "/" ? SITE.homeTitle : documentTitle(pageName);
	const category = path.startsWith("/ui/overview/")
		? catalogCategory(path.slice("/ui/overview/".length))
		: undefined;
	const template = path.startsWith("/templates/")
		? getTemplateByManifestSlug(path.slice("/templates/".length))
		: undefined;
	const description = category
		? `${category.description} Design thinking, sizing, interaction and best practices for Basalt ${category.label.toLowerCase()}.`
		: template
			? (TEMPLATE_DESCRIPTIONS[path] ?? template.description)
			: path === "/"
				? SITE.description
				: (PAGE_DESCRIPTIONS[path] ??
					(path.startsWith("/ui/")
						? `${pageName?.trim() || "Component"} in the Basalt React UI library. Explore live examples, TypeScript APIs, accessibility details, and source code.`
						: `${pageName?.trim() || "Interface"} examples built with Basalt React components. Explore the working layout, matte surfaces, and open-source implementation.`));
	return { path, title, description };
}

/** All share/search metadata is updated together on direct loads and client navigation. */
export function pageMetaTags(page: PageMetadata) {
	return [
		{ attribute: "name", key: "description", content: page.description },
		{ attribute: "property", key: "og:title", content: page.title },
		{ attribute: "property", key: "og:description", content: page.description },
		{ attribute: "property", key: "og:url", content: canonicalUrl(page.path) },
		{ attribute: "name", key: "twitter:title", content: page.title },
		{ attribute: "name", key: "twitter:description", content: page.description },
	] as const;
}

export function applyMetadataToHtml(html: string, page: PageMetadata): string {
	function upsert(pattern: RegExp, tag: string) {
		html = pattern.test(html)
			? html.replace(pattern, () => tag)
			: html.replace("</head>", () => `    ${tag}\n  </head>`);
	}
	upsert(/<title>[^<]*<\/title>/, `<title>${escapeXml(page.title)}</title>`);
	upsert(
		/<link rel="canonical"[^>]*>/,
		`<link rel="canonical" href="${escapeXml(canonicalUrl(page.path))}" />`,
	);
	for (const tag of pageMetaTags(page)) {
		upsert(
			new RegExp(`<meta ${tag.attribute}="${tag.key}"[^>]*>`),
			`<meta ${tag.attribute}="${tag.key}" content="${escapeXml(tag.content)}" />`,
		);
	}
	upsert(
		/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
		`<script type="application/ld+json">${jsonLdScript(page)}</script>`,
	);
	return html;
}
