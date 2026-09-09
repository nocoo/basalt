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
		"A React analytics dashboard template with financial metrics, activity, bar charts, and expense breakdowns. Explore the live Basalt layout and source.",
	"/banking":
		"A React banking and wealth dashboard template with balances, portfolios, and transaction views. Built with the open-source Basalt design system.",
	"/network":
		"A React network operations dashboard template for traffic, service health, and system activity. Explore the live Basalt components and charts.",
	"/wearable":
		"A React health and activity dashboard template with wearable metrics and trends. Explore the live example built with Basalt components and charts.",
	"/layout":
		"Build a responsive React application shell with Basalt: sidebar navigation, a header, scrollable content, page headings, and layered surfaces.",
	"/login":
		"A responsive React sign-in page example built with Basalt form controls and matte surfaces. Preview the layout and adapt the open-source code.",
	"/palette":
		"Explore the Basalt design system color palette. Customize accent colors, chart palettes, and matte surfaces across light and dark themes.",
};

export function pageMetadata(pathname: string, pageName?: string): PageMetadata {
	const path = pathname.replace(/\/+$/, "") || "/";
	const title = path === "/" ? SITE.homeTitle : documentTitle(pageName);
	const description =
		path === "/"
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
