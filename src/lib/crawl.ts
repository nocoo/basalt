import { LANDING_HEADING, LANDING_LEDE, renderLandingBody } from "./landing";
import { absoluteUrl, canonicalUrl, documentTitle, SITE } from "./site";

export interface CrawlPage {
	path: string;
	title: string;
	description: string;
	heading: string;
	html: string;
}

export function catalogCrawlPage(slug: string, name: string, description?: string): CrawlPage {
	const path = `/ui/${slug}`;
	const heading = name;
	const summary =
		description?.trim() ||
		`${name} is part of the ${SITE.packageName} catalog. Open the interactive documentation without a JavaScript requirement for this summary.`;
	return {
		path,
		title: documentTitle(name),
		description: `${name} — ${SITE.description}`,
		heading,
		html: [
			`<a class="skip" href="#main-content">Skip to main content</a>`,
			`<main id="main-content">`,
			`<p><a href="/">${SITE.title}</a> · <a href="/ui">Catalog</a></p>`,
			`<h1>${heading}</h1>`,
			`<p>${summary}</p>`,
			`<p>Package: <code>${SITE.packageName}</code>. Source and examples: <a href="${absoluteUrl(path)}">${absoluteUrl(path)}</a>.</p>`,
			`</main>`,
		].join(""),
	};
}

export function homeCrawlPage(): CrawlPage {
	return {
		path: "/",
		title: SITE.title,
		description: SITE.description,
		heading: LANDING_HEADING,
		html: renderLandingBody(),
	};
}

export function uiIndexCrawlPage(links: ReadonlyArray<{ slug: string; name: string }>): CrawlPage {
	const items = links
		.map((entry) => `<li><a href="/ui/${entry.slug}">${entry.name}</a></li>`)
		.join("");
	return {
		path: "/ui",
		title: documentTitle("Catalog"),
		description: `Component, chart and block catalog for ${SITE.packageName}.`,
		heading: "Catalog",
		html: [
			`<a class="skip" href="#main-content">Skip to main content</a>`,
			`<main id="main-content">`,
			`<p><a href="/">${SITE.title}</a></p>`,
			`<h1>Catalog</h1>`,
			`<p>${LANDING_LEDE} Browse every published surface below.</p>`,
			`<ul>${items}</ul>`,
			`</main>`,
		].join(""),
	};
}

export function applyCrawlPage(html: string, page: CrawlPage): string {
	const canonical = canonicalUrl(page.path);
	let next = html;
	next = next.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
	next = next.replace(
		/<meta name="description" content="[^"]*" \/>/,
		`<meta name="description" content="${page.description}" />`,
	);
	next = next.replace(
		/<link rel="canonical" href="[^"]*" \/>/,
		`<link rel="canonical" href="${canonical}" />`,
	);
	next = next.replace(
		/<meta property="og:title" content="[^"]*" \/>/,
		`<meta property="og:title" content="${page.title}" />`,
	);
	next = next.replace(
		/<meta property="og:url" content="[^"]*" \/>/,
		`<meta property="og:url" content="${canonical}" />`,
	);
	next = next.replace(
		/<meta property="og:description" content="[^"]*" \/>/,
		`<meta property="og:description" content="${page.description}" />`,
	);
	if (next.includes("<!--seo:body-->")) {
		next = next.replace(
			/<!--seo:body-->[\s\S]*?<!--\/seo:body-->/,
			`<!--seo:body-->${page.html}<!--/seo:body-->`,
		);
	} else {
		next = next.replace(
			/<div id="root">[\s\S]*?<\/div>/,
			`<div id="root"><!--seo:body-->${page.html}<!--/seo:body--></div>`,
		);
	}
	return next;
}
