import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
	absoluteUrl,
	canonicalUrl,
	documentTitle,
	escapeXml,
	imageUrl,
	jsonLd,
	jsonLdScript,
	previewRobotTag,
	renderHeaders,
	renderLlms,
	renderLlmsFull,
	renderRobots,
	renderSitemap,
	requiredIndexHtmlSnippets,
	SHOWCASE_PATHS,
	SHOWCASE_TITLE_KEYS,
	SITE,
	SITE_ORIGIN,
	serviceDocLink,
	sitemapPaths,
} from "./site";

describe("site metadata", () => {
	it("keeps the committed social image at the Open Graph size", () => {
		const png = readFileSync("public/opengraph-image.png");
		expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
		expect(png.readUInt32BE(16)).toBe(SITE.image.width);
		expect(png.readUInt32BE(20)).toBe(SITE.image.height);
	});

	it("builds absolute, canonical and image URLs", () => {
		expect(absoluteUrl()).toBe(`${SITE_ORIGIN}/`);
		expect(absoluteUrl("/ui")).toBe(`${SITE_ORIGIN}/ui`);
		expect(canonicalUrl("/")).toBe(`${SITE_ORIGIN}/`);
		expect(canonicalUrl("")).toBe(`${SITE_ORIGIN}/`);
		expect(canonicalUrl("/ui/")).toBe(`${SITE_ORIGIN}/ui`);
		expect(canonicalUrl("/ui/button")).toBe(`${SITE_ORIGIN}/ui/button`);
		expect(imageUrl()).toBe(`${SITE_ORIGIN}/opengraph-image.png`);
		expect(() => absoluteUrl("ui")).toThrow(/absolute/);
	});

	it("keeps the bare wordmark as the document title", () => {
		expect(documentTitle()).toBe(SITE.title);
		expect(documentTitle("   ")).toBe(SITE.title);
		expect(documentTitle(SITE.title)).toBe(SITE.title);
		expect(documentTitle("Button")).toBe(`Button · ${SITE.title}`);
	});

	it("emits SoftwareApplication JSON-LD without raw angle brackets", () => {
		const graph = jsonLd();
		expect(jsonLdScript()).toBe(JSON.stringify(graph).replace(/</g, "\\u003c"));
		expect(jsonLdScript()).not.toContain("<");
		expect(graph["@graph"]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ "@type": "WebSite", url: `${SITE_ORIGIN}/` }),
				expect.objectContaining({
					"@type": "SoftwareApplication",
					alternateName: SITE.packageName,
					downloadUrl: SITE.npm,
				}),
			]),
		);
	});

	it("lists showcase paths that exist as App routes and omits utility states", () => {
		const app = readFileSync("src/App.tsx", "utf8");
		for (const path of SHOWCASE_PATHS) {
			expect(app).toContain(`path="${path}"`);
		}
		expect(SHOWCASE_PATHS).not.toContain("/404");
		expect(SHOWCASE_PATHS).not.toContain("/loading");
		expect(SHOWCASE_TITLE_KEYS["/404"]).toBe("nav.notFoundPage");
		expect(SHOWCASE_TITLE_KEYS["/loading"]).toBe("nav.loading");
		expect(SHOWCASE_TITLE_KEYS["/ui"]).toBe("nav.kitIndex");
	});

	it("sorts sitemap paths and includes catalog slugs", () => {
		expect(sitemapPaths(["/ui", "/"], ["button", "text"])).toEqual([
			"/",
			"/ui",
			"/ui/button",
			"/ui/text",
		]);
	});

	it("escapes XML and renders a urlset", () => {
		expect(escapeXml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&apos;");
		const xml = renderSitemap(["/", "/ui"]);
		expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
		expect(xml).toContain(`<loc>${SITE_ORIGIN}/</loc>`);
		expect(xml).toContain(`<loc>${SITE_ORIGIN}/ui</loc>`);
	});

	it("allows every crawler and points robots at the sitemap", () => {
		const robots = renderRobots();
		expect(robots).toContain("User-agent: *");
		expect(robots).toContain("Allow: /");
		expect(robots).not.toContain("Disallow:");
		expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
		expect(robots).toContain("/llms.txt");
	});

	it("orients agents at the catalog, package docs and related portfolio", () => {
		const llms = renderLlms();
		expect(llms.startsWith(`# ${SITE.name}\n`)).toBe(true);
		expect(llms).toContain(SITE.description);
		expect(llms).toContain("AI crawlers");
		expect(llms).toContain(SITE.packageName);
		expect(llms).toContain(SITE.npm);
		expect(llms).toContain(SITE.github);
		expect(llms).toContain(SITE.portfolio);
		expect(llms).toContain("/llms-full.txt");
		expect(llms).toContain(SITE.usageGuide);
	});

	it("groups the full catalog by family and links each surface", () => {
		const full = renderLlmsFull([
			{ slug: "line", name: "Line", category: "chart" },
			{ slug: "button", name: "Button", category: "component" },
			{ slug: "page-header", name: "Page Header", category: "block" },
			{ slug: "text", name: "Text", category: "component" },
		]);
		expect(full).toContain("## Components");
		expect(full.indexOf("- [Button]")).toBeLessThan(full.indexOf("- [Text]"));
		expect(full).toContain(`${SITE_ORIGIN}/ui/line`);
		expect(full).toContain("## Charts");
		expect(full).toContain("## Blocks");
		expect(full).toContain("/llms.txt");
	});

	it("keeps unknown catalog families out of the grouped sections", () => {
		const full = renderLlmsFull([
			{ slug: "ghost", name: "Ghost", category: "component" },
			{ slug: "stray", name: "Stray", category: "chart" },
		]);
		expect(full).toContain("/ui/ghost");
		expect(full).not.toContain("/ui/missing");
	});

	it("publishes service-doc headers without preview noindex", () => {
		expect(previewRobotTag()).toBe("noindex");
		expect(serviceDocLink()).toBe(
			`<${SITE_ORIGIN}/llms.txt>; rel="service-doc"; type="text/plain"`,
		);
		expect(serviceDocLink("https://basalt.dev.hexly.ai")).toContain("basalt.dev.hexly.ai/llms.txt");
		const headers = renderHeaders();
		expect(headers).toContain('rel="service-doc"');
		expect(headers).not.toContain("X-Robots-Tag");
		expect(headers).toContain("X-Content-Type-Options: nosniff");
	});

	it("keeps index.html snippets aligned with the live document", () => {
		const html = readFileSync("index.html", "utf8");
		for (const snippet of requiredIndexHtmlSnippets()) {
			expect(html).toContain(snippet);
		}
		expect(html).not.toContain("hexly.ai/og");
		expect(html).not.toContain("hexly.ai/api/share");
	});

	it("marks the Vite preview noindex and does not fetch Hexly share metadata", () => {
		const vite = readFileSync("vite.config.ts", "utf8");
		expect(vite).toContain('setHeader("X-Robots-Tag", "noindex")');
		expect(vite).toContain("https://basaltui.com/llms.txt");
		expect(vite).not.toContain("hexly.ai/api/share");
	});

	it("ignores catalog rows whose family is not a published heading", () => {
		const full = renderLlmsFull([
			{ slug: "ghost", name: "Ghost", category: "other" as "component" },
		]);
		expect(full).toContain("## Components");
		expect(full).not.toContain("/ui/ghost");
	});
});
