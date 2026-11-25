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
	renderAgentsMd,
	renderAiTxt,
	renderHeaders,
	renderLlms,
	renderLlmsFull,
	renderRobots,
	renderSetupMd,
	renderSitemap,
	requiredIndexHtmlSnippets,
	SHOWCASE_PATHS,
	SHOWCASE_TITLES,
	SITE,
	SITE_ORIGIN,
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

	it("uses a descriptive homepage title while keeping page names distinct", () => {
		expect(documentTitle()).toBe(SITE.homeTitle);
		expect(documentTitle("   ")).toBe(SITE.homeTitle);
		expect(documentTitle(SITE.title)).toBe(SITE.homeTitle);
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
		expect(SHOWCASE_TITLES["/404"]).toBe("404 Page");
		expect(SHOWCASE_TITLES["/loading"]).toBe("Loading");
		expect(SHOWCASE_TITLES["/ui"]).toBe("Component library");
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
		expect(robots).toContain("/ai.txt");
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
		expect(llms).toContain("https://lizheng.me/");
		expect(llms).toContain("/llms-full.txt");
		expect(llms).toContain(SITE.usageGuide);
		for (const endpoint of [
			"/ui/<slug>.md",
			"/ui/overview/<category>.md",
			"/templates/<slug>.md",
			"/templates",
			"/templates.md",
			"/agents.md",
			"/setup.md",
			"/ui.md",
			"/md-catalog.json",
			"/ai.txt",
		]) {
			expect(llms, endpoint).toContain(endpoint);
		}
	});

	it("groups the full catalog by family and links each surface", () => {
		const full = renderLlmsFull([
			{ slug: "chart", name: "Chart", category: "layout" },
			{
				slug: "button",
				name: "Button",
				category: "action",
				importPath: "@nocoo/basalt/components/button",
				useWhen: "Trigger primary or secondary actions.",
			},
			{ slug: "page-header", name: "Page Header", category: "block" },
			{ slug: "text", name: "Text", category: "action" },
		]);
		expect(full).toContain("## Actions");
		expect(full.indexOf("- [Button]")).toBeLessThan(full.indexOf("- [Text]"));
		expect(full).toContain(`${SITE_ORIGIN}/ui/chart`);
		expect(full).toContain(`${SITE_ORIGIN}/ui/chart.md`);
		expect(full).toContain(`${SITE_ORIGIN}/ui/button.md`);
		expect(full).toContain("@nocoo/basalt/components/button");
		expect(full).toContain("Trigger primary or secondary actions.");
		expect(full).toContain(`${SITE_ORIGIN}/ui/overview/action.md`);
		expect(full).toContain("## Layouts");
		expect(full).toContain("## Blocks");
		expect(full).toContain("## Templates");
		expect(full).toContain(`${SITE_ORIGIN}/templates.md`);
		expect(full).toContain(`${SITE_ORIGIN}/templates/agent-workspace.md`);
		expect(full).toContain(`${SITE_ORIGIN}/view/agent-workspace`);
		expect(full).toContain(`${SITE_ORIGIN}/templates/visitor-login.md`);
		expect(full).toContain("/llms.txt");
	});

	it("keeps unknown catalog families out of the grouped sections", () => {
		const full = renderLlmsFull([
			{ slug: "ghost", name: "Ghost", category: "action" },
			{ slug: "stray", name: "Stray", category: "layout" },
		]);
		expect(full).toContain("/ui/ghost");
		expect(full).not.toContain("/ui/missing");
	});

	it("publishes service-doc headers without preview noindex", () => {
		const headers = renderHeaders();
		expect(headers).toContain('rel="service-doc"');
		expect(headers).not.toContain("X-Robots-Tag");
		expect(headers).toContain("X-Content-Type-Options: nosniff");
		expect(headers).toContain("Content-Security-Policy:");
		expect(headers).toContain("Permissions-Policy:");
		expect(headers).toContain("Cross-Origin-Opener-Policy: same-origin-allow-popups");
		expect(headers).toContain("Cross-Origin-Resource-Policy: same-origin");
		expect(headers).toContain("/opengraph-image.png\n  Cross-Origin-Resource-Policy: cross-origin");
		expect(headers).toContain(
			"/llms.txt\n  Content-Type: text/plain; charset=utf-8\n  X-Content-Type-Options: nosniff\n  Access-Control-Allow-Origin: *",
		);
		expect(headers).toContain(
			"/ai.txt\n  Content-Type: text/plain; charset=utf-8\n  X-Content-Type-Options: nosniff\n  Access-Control-Allow-Origin: *",
		);
		expect(headers).toContain(
			"/md-catalog.json\n  Content-Type: application/json; charset=utf-8\n  X-Content-Type-Options: nosniff\n  Access-Control-Allow-Origin: *",
		);
		for (const mdPath of [
			"/agents.md",
			"/setup.md",
			"/index.md",
			"/ui.md",
			"/ui/*.md",
			"/ui/overview/*.md",
			"/templates.md",
			"/templates/*.md",
		]) {
			expect(headers, mdPath).toContain(
				`${mdPath}\n  Content-Type: text/markdown; charset=utf-8\n  X-Content-Type-Options: nosniff\n  Access-Control-Allow-Origin: *`,
			);
		}
	});

	it("renders agents.md, setup.md, and ai.txt discovery documents", () => {
		const agents = renderAgentsMd();
		expect(agents.startsWith("<!-- basalt:start -->\n")).toBe(true);
		expect(agents).toContain("<!-- basalt:end -->");
		expect(agents).toContain("L0–L3");
		expect(agents).toContain("backdrop-blur");
		expect(agents).toContain("2/4/6/8px");
		expect(agents).toContain("12/16/24/32px");
		expect(agents).toContain("@nocoo/basalt/styles/standalone");
		expect(agents).toContain('"use client"');
		expect(agents).toContain("<Toaster />");
		expect(agents).toContain("## Components (81)");
		expect(agents).toMatch(/\|\s*Button\s*\|\s*`button`\s*\|\s*action\s*\|/);
		expect(agents).toMatch(/\|\s*Chart\s*\|\s*`chart`\s*\|\s*layout\s*\|/);
		expect(agents).toContain("## Templates (7)");
		expect(agents).toMatch(/\|\s*Agent workspace\s*\|\s*`agent-workspace`\s*\|\s*workspaces\s*\|/);

		const setup = renderSetupMd();
		expect(setup).toContain("@nocoo/basalt");
		expect(setup).toContain("@nocoo/basalt/styles");
		expect(setup).toContain("@nocoo/basalt/styles/standalone");
		expect(setup).toContain("@nocoo/basalt/fonts.css");
		expect(setup).toContain("ThemeProvider");
		expect(setup).toContain("LinkProvider");
		expect(setup).toContain("<Toaster />");
		expect(setup).toContain(`${SITE_ORIGIN}/agents.md`);

		const ai = renderAiTxt();
		expect(ai).toContain("User-Agent: *");
		expect(ai).toContain("Allow: /");
		expect(ai).toContain(`Attribution: ${SITE.name} (${SITE_ORIGIN})`);
		expect(ai).toContain(`Scope:`);
		expect(ai).toContain("/ui/*.md");
		expect(ai).toContain("/templates/*.md");
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
		const full = renderLlmsFull([{ slug: "ghost", name: "Ghost", category: "other" as "action" }]);
		expect(full).toContain("## Actions");
		expect(full).not.toContain("/ui/ghost");
	});
});
