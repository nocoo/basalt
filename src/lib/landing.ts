import { escapeXml, jsonLdScript, SITE, SITE_ORIGIN } from "./site";

export const LANDING_HEADING = "Dense, dark, durable.";

export const LANDING_KICKER = SITE.packageName;

export const LANDING_LEDE = SITE.description;

export const LANDING_INSTALL = "npm i @nocoo/basalt lucide-react";

export const LANDING_HERO_IMAGE = "/landing/ridge.jpg";

export const LANDING_SECTION_IMAGE = "/landing/ocean.jpg";

export interface LandingLink {
	href: string;
	label: string;
	external?: boolean;
}

export const LANDING_PRIMARY_LINKS: readonly LandingLink[] = [
	{ href: "/ui", label: "Catalog" },
	{ href: "/dashboard", label: "Examples" },
	{ href: "/layout", label: "App frame" },
	{ href: "/login", label: "Login" },
];

export const LANDING_PACKAGE_LINKS: readonly LandingLink[] = [
	{ href: SITE.npm, label: "npm", external: true },
	{ href: SITE.github, label: "GitHub", external: true },
];

export const LANDING_RELATED_LINKS: readonly LandingLink[] = [
	{ href: SITE.portfolio, label: "Portfolio", external: true },
	{ href: "https://lizheng.me/", label: "Play", external: true },
	{ href: "https://lizheng.blog/", label: "Journal", external: true },
	{ href: "https://lizheng.dev/", label: "Résumé", external: true },
];

export const LANDING_FACTS: ReadonlyArray<{ title: string; body: string }> = [
	{
		title: "Matte luminance",
		body: "Three stacked surfaces — body, island, card — create depth with light instead of chrome borders.",
	},
	{
		title: "Granular ESM",
		body: "A light root barrel for everyday controls, plus subpaths for charts and heavy widgets so product bundles stay small.",
	},
	{
		title: "App chrome included",
		body: "Rail, header, island, login badge and page heading ship as recipes. The catalog is the working documentation.",
	},
];

function escapeHtml(value: string): string {
	return escapeXml(value);
}

function anchor(link: LandingLink): string {
	const rel = link.external ? ' rel="noopener noreferrer"' : "";
	const target = link.external ? ' target="_blank"' : "";
	return `<a href="${escapeHtml(link.href)}"${rel}${target}>${escapeHtml(link.label)}</a>`;
}

export function renderLandingBody(): string {
	const nav = [...LANDING_PRIMARY_LINKS, ...LANDING_PACKAGE_LINKS].map(anchor).join("");
	const facts = LANDING_FACTS.map(
		(fact) =>
			`<article><h2>${escapeHtml(fact.title)}</h2><p>${escapeHtml(fact.body)}</p></article>`,
	).join("");
	const related = LANDING_RELATED_LINKS.map(anchor).join(" · ");
	const packageLinks = LANDING_PACKAGE_LINKS.map(anchor).join(" · ");
	return [
		`<a class="skip" href="#main-content">Skip to main content</a>`,
		`<header>`,
		`<p class="mark"><img src="/logo-128.png" width="24" height="24" alt="${escapeHtml(SITE.name)}"> ${escapeHtml(SITE.title)}</p>`,
		`<nav aria-label="Site">${nav}</nav>`,
		`</header>`,
		`<main id="main-content">`,
		`<section class="hero">`,
		`<p class="kicker">${escapeHtml(LANDING_KICKER)}</p>`,
		`<h1>${escapeHtml(LANDING_HEADING)}</h1>`,
		`<p class="lede">${escapeHtml(LANDING_LEDE)}</p>`,
		`<p class="cta">${anchor({ href: "/ui", label: "Browse the catalog" })} ${anchor({ href: SITE.npm, label: "Install on npm", external: true })}</p>`,
		`</section>`,
		`<section>`,
		`<h2>A design system for dense software</h2>`,
		`<p>${escapeHtml(SITE.name)} is a React 19 component library and a public catalog. It is built for information-rich products: tables, filters, charts, app shells and long sessions. The identity is a Hanbaiyu marble corner tower; the interface is matte, measured and quiet.</p>`,
		`<p>Install <code>${escapeHtml(SITE.packageName)}</code>. Read the catalog at ${anchor({ href: "/ui", label: "basaltui.com/ui" })}. Application recipes live at ${anchor({ href: "/layout", label: "/layout" })} and ${anchor({ href: "/login", label: "/login" })}.</p>`,
		`</section>`,
		`<section class="facts">${facts}</section>`,
		`<section>`,
		`<h2>Install</h2>`,
		`<pre><code>${escapeHtml(LANDING_INSTALL)}</code></pre>`,
		`<p>${packageLinks}</p>`,
		`</section>`,
		`<section>`,
		`<h2>Catalog</h2>`,
		`<p>Components, charts and blocks with live examples. Open ${anchor({ href: "/ui", label: "the catalog index" })} or jump to ${anchor({ href: "/dashboard", label: "example dashboards" })}.</p>`,
		`</section>`,
		`</main>`,
		`<footer>`,
		`<p>${escapeHtml(SITE.title)} · ${packageLinks}</p>`,
		`<p>Related: ${related}</p>`,
		`</footer>`,
	].join("");
}

export function renderLandingStyle(): string {
	return [
		"<style>",
		"html,body{margin:0;background:#171717;color:#ececec;font-family:ui-sans-serif,system-ui,sans-serif;}",
		".skip{position:absolute;left:-999px;top:0} .skip:focus{left:12px;background:#171717;padding:8px}",
		"header,main,footer{max-width:720px;margin:0 auto;padding:24px 20px}",
		"header{display:flex;justify-content:space-between;gap:16px;align-items:center}",
		"nav a,footer a,main a{color:#d7c4a3}",
		"h1{font-size:2.25rem;line-height:1.15;margin:12px 0}",
		"h2{font-size:1.1rem;margin:28px 0 8px}",
		".kicker,.mark{letter-spacing:.08em;text-transform:lowercase;color:#a8987e}",
		"pre{background:#111;padding:12px 16px;overflow:auto}",
		".facts article{margin:16px 0}",
		"</style>",
	].join("");
}

export function landingBodyMarkers(inner: string): string {
	return `<!--seo:body-->${inner}<!--/seo:body-->`;
}

export function applyLandingToIndexHtml(html: string): string {
	let next = html;
	if (!next.includes('rel="canonical"')) {
		next = next.replace(
			"</title>",
			`</title>\n    <link rel="canonical" href="${SITE_ORIGIN}/" />`,
		);
	}
	if (!next.includes("basalt-landing-css")) {
		next = next.replace(
			"</head>",
			`    ${renderLandingStyle().replace("<style>", '<style id="basalt-landing-css">')}\n  </head>`,
		);
	}
	next = next.replace(
		/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
		`<script type="application/ld+json">${jsonLdScript()}</script>`,
	);
	if (next.includes("<!--seo:body-->")) {
		return next.replace(
			/<!--seo:body-->[\s\S]*?<!--\/seo:body-->/,
			landingBodyMarkers(renderLandingBody()),
		);
	}
	return next.replace(
		/<div id="root">[\s\S]*?<\/div>/,
		`<div id="root">${landingBodyMarkers(renderLandingBody())}</div>`,
	);
}

export function requiredLandingSnippets(): string[] {
	return [
		`<h1>${LANDING_HEADING}</h1>`,
		'id="main-content"',
		"Skip to main content",
		SITE.packageName,
		SITE.npm,
		SITE.github,
		SITE.portfolio,
		"https://lizheng.me/",
		'<link rel="canonical" href="https://basaltui.com/" />',
	];
}
