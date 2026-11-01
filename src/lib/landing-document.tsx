import { renderToStaticMarkup } from "react-dom/server";
import { LandingContent } from "../components/landing/LandingContent";
import { HERO_PRELOAD_START, heroPreloadBlock, stripHeroPreload } from "./landing-images";
import { applyMetadataToHtml, pageMetadata } from "./metadata";
import { SITE } from "./site";

/** Build-only renderer. Keep react-dom/server out of the interactive route. */
export function renderLandingBody(): string {
	return renderToStaticMarkup(<LandingContent />);
}

/** Self-hosted DM Sans (see src/styles/fonts.css); every document preloads the latin subset. */
export const FONT_PRELOAD =
	'<link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin />';

export function landingBodyMarkers(inner: string): string {
	return `<!--seo:body-->${inner}<!--/seo:body-->`;
}

export function applyLandingToIndexHtml(html: string): string {
	// Regeneration must also remove the previous unscoped fallback CSS.
	let next = applyMetadataToHtml(html, pageMetadata("/")).replace(
		/\s*<style id="basalt-landing-css">[\s\S]*?<\/style>/g,
		"",
	);
	// A real stylesheet link makes the same layout available before JS and with JS disabled.
	if (!next.includes('href="/src/index.css"')) {
		next = next.replace(
			"</head>",
			'    <link rel="stylesheet" href="/src/index.css" />\n  </head>',
		);
	}
	// Hint the hero preview (the LCP element) before the stylesheet and font requests.
	next = stripHeroPreload(next);
	next = next.includes(FONT_PRELOAD)
		? next.replace(FONT_PRELOAD, () => `${heroPreloadBlock()}\n    ${FONT_PRELOAD}`)
		: next.replace("</head>", () => `    ${heroPreloadBlock()}\n  </head>`);
	const body = landingBodyMarkers(renderLandingBody());
	if (next.includes("<!--seo:body-->")) {
		return next.replace(/<!--seo:body-->[\s\S]*?<!--\/seo:body-->/, () => body);
	}
	return next.replace(/<div id="root">[\s\S]*?<\/div>/, () => `<div id="root">${body}</div>`);
}

export function requiredLandingSnippets(): string[] {
	return [
		'id="landing-title"',
		'id="landing-version"',
		'id="main-content"',
		'id="templates"',
		'id="get-started"',
		"Skip to main content",
		SITE.packageName,
		SITE.npm,
		SITE.github,
		SITE.portfolio,
		"https://lizheng.me/",
		'<link rel="canonical" href="https://basaltui.com/" />',
		HERO_PRELOAD_START,
	];
}
