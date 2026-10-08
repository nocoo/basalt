import { catalogNavName, libraryNavEntries } from "../pages/ui/catalog";
import {
	CATALOG_CATEGORIES,
	type CatalogCategory,
	catalogCategory,
	catalogCategoryPath,
} from "../pages/ui/catalog-categories";
import { CATEGORY_GUIDES } from "../pages/ui/catalog-category-guides";
import { LANDING_HEADING, LANDING_LEDE, LANDING_TEMPLATES } from "./landing";
import { renderLandingBody } from "./landing-document";
import { applyMetadataToHtml, pageMetadata } from "./metadata";
import { absoluteUrl, escapeXml, type PageMetadata, SITE } from "./site";

export interface CrawlPage extends PageMetadata {
	heading: string;
	html: string;
}

function crawlShell(heading: string, content: string): string {
	return [
		"<div data-crawl-page>",
		'<a href="#main-content">Skip to main content</a>',
		'<main id="main-content" tabindex="-1">',
		`<p><a href="/">${SITE.title}</a> · <a href="/ui">Component library</a></p>`,
		`<h1>${escapeXml(heading)}</h1>`,
		content,
		"</main></div>",
	].join("");
}

export function catalogCrawlPage(slug: string, name: string, description?: string): CrawlPage {
	const path = `/ui/${slug}`;
	const metadata = pageMetadata(path, name);
	const summary = description?.trim() || metadata.description;
	return {
		...metadata,
		heading: name,
		html: crawlShell(
			name,
			[
				`<p>${escapeXml(summary)}</p>`,
				`<p>Package: <code>${SITE.packageName}</code>. Explore the live examples and TypeScript API, or <a href="${SITE.github}">browse the source on GitHub</a>.</p>`,
				`<p><a href="${escapeXml(absoluteUrl(path))}">Open ${escapeXml(name)}</a> · <a href="/ui">Browse all components</a></p>`,
			].join(""),
		),
	};
}

export function homeCrawlPage(): CrawlPage {
	return {
		...pageMetadata("/"),
		heading: LANDING_HEADING,
		html: renderLandingBody(),
	};
}

export function uiIndexCrawlPage(links: ReadonlyArray<{ slug: string; name: string }>): CrawlPage {
	const overviews = CATALOG_CATEGORIES.map(
		(category) =>
			`<li><a href="${catalogCategoryPath(category.id)}">${category.label} overview</a></li>`,
	).join("");
	const items = links
		.map((entry) => `<li><a href="/ui/${escapeXml(entry.slug)}">${escapeXml(entry.name)}</a></li>`)
		.join("");
	return {
		...pageMetadata("/ui", "Component library"),
		heading: "Component library",
		html: crawlShell(
			"Component library",
			`<p>${escapeXml(LANDING_LEDE)} Browse every published surface below.</p><h2>Design overviews</h2><ul>${overviews}</ul><h2>Catalog</h2><ul>${items}</ul>`,
		),
	};
}

export function categoryCrawlPage(id: CatalogCategory): CrawlPage {
	const category = catalogCategory(id);
	if (!category) throw new Error(`Unknown catalog category: ${id}`);
	const heading = `${category.label} overview`;
	const guide = CATEGORY_GUIDES[id];
	const section = (title: string, text: string) => `<h2>${title}</h2><p>${escapeXml(text)}</p>`;
	return {
		...pageMetadata(catalogCategoryPath(id), heading),
		heading,
		html: crawlShell(
			heading,
			[
				`<p>${escapeXml(category.description)}</p>`,
				section("Design thinking", guide.rationale),
				section("Size and spacing", `${category.size}. ${guide.geometry}`),
				section("Interaction and motion", guide.interaction),
				`<h2>Best practices</h2><ul>${guide.practices.map((text) => `<li>${escapeXml(text)}</li>`).join("")}</ul>`,
				`<h2>In this group</h2><ul>${libraryNavEntries(id)
					.map(
						(entry) =>
							`<li><a href="/ui/${entry.slug}">${escapeXml(catalogNavName(entry))}</a></li>`,
					)
					.join("")}</ul>`,
			].join(""),
		),
	};
}

export function showcaseCrawlPage(path: string, name: string): CrawlPage {
	const metadata = pageMetadata(path, name);
	const template = LANDING_TEMPLATES.find((entry) => entry.href === path);
	return {
		...metadata,
		heading: name,
		html: crawlShell(
			name,
			[
				`<p>${escapeXml(metadata.description)}</p>`,
				template
					? `<img src="/landing/${template.image}-light.webp" alt="${escapeXml(template.name)} preview" width="1440" height="900" />`
					: "",
				`<p>This example uses sample data. Adapt the layout with <code>${SITE.packageName}</code>, then connect your own application services.</p>`,
				`<p><a href="/ui">Explore the component library</a> · <a href="${SITE.github}">Source and integration guides</a> · <a href="/#templates">More templates</a></p>`,
			].join(""),
		),
	};
}

export function applyCrawlPage(html: string, page: CrawlPage): string {
	const next = applyMetadataToHtml(html, page);
	const body = `<!--seo:body-->${page.html}<!--/seo:body-->`;
	return next.includes("<!--seo:body-->")
		? next.replace(/<!--seo:body-->[\s\S]*?<!--\/seo:body-->/, () => body)
		: next.replace(/<div id="root">[\s\S]*?<\/div>/, () => `<div id="root">${body}</div>`);
}
