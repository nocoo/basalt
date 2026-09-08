import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyCrawlPage, catalogCrawlPage, homeCrawlPage, uiIndexCrawlPage } from "./crawl";
import {
	applyLandingToIndexHtml,
	LANDING_HEADING,
	LANDING_RELATED_LINKS,
	renderLandingBody,
	requiredLandingSnippets,
} from "./landing";
import { SITE } from "./site";

describe("landing document", () => {
	it("exposes a real heading, skip link and off-site brand links without JavaScript", () => {
		const body = renderLandingBody();
		expect(body).toContain(`<h1>${LANDING_HEADING}</h1>`);
		expect(body).toContain('id="main-content"');
		expect(body).toContain("Skip to main content");
		expect(body).toContain(SITE.npm);
		expect(body).toContain(SITE.github);
		expect(body).toContain(SITE.portfolio);
		expect(LANDING_RELATED_LINKS.map((link) => link.href)).toEqual(
			expect.arrayContaining([
				"https://lizheng.me/",
				"https://lizheng.blog/",
				"https://lizheng.dev/",
			]),
		);
	});

	it("keeps index.html filled with the landing body and a canonical URL", () => {
		const html = readFileSync("index.html", "utf8");
		for (const snippet of requiredLandingSnippets()) {
			expect(html).toContain(snippet);
		}
		expect(html).toContain("<!--seo:body-->");
		expect(applyLandingToIndexHtml(html)).toContain(`<h1>${LANDING_HEADING}</h1>`);
	});

	it("injects canonical, style and body into a bare HTML shell", () => {
		const html = applyLandingToIndexHtml(
			'<!doctype html><html><head><title>basalt.</title></head><body><div id="root"></div></body></html>',
		);
		expect(html).toContain('rel="canonical"');
		expect(html).toContain("basalt-landing-css");
		expect(html).toContain("<!--seo:body-->");
		expect(html).toContain(`<h1>${LANDING_HEADING}</h1>`);
	});

	it("writes page-specific crawl HTML for catalog surfaces", () => {
		const page = catalogCrawlPage("button", "Button", "Primary actions.");
		expect(page.heading).toBe("Button");
		expect(page.html).toContain("<h1>Button</h1>");
		expect(page.html).toContain("Primary actions.");
		expect(catalogCrawlPage("text", "Text").html).toContain("@nocoo/basalt");
		const marked = applyCrawlPage(
			'<!doctype html><html><head><title>x</title><meta name="description" content="d" /><link rel="canonical" href="https://basaltui.com/" /><meta property="og:title" content="t" /><meta property="og:url" content="https://basaltui.com" /><meta property="og:description" content="d" /></head><body><div id="root"><!--seo:body-->old<!--/seo:body--></div></body></html>',
			catalogCrawlPage("button", "Button", "Primary actions."),
		);
		expect(marked).toContain("<h1>Button</h1>");
		expect(marked).not.toContain("old");
		const index = uiIndexCrawlPage([{ slug: "button", name: "Button" }]);
		expect(index.html).toContain('href="/ui/button"');
		const applied = applyCrawlPage(
			'<html><head><title>x</title><meta name="description" content="d" /><link rel="canonical" href="https://basaltui.com/" /><meta property="og:title" content="t" /><meta property="og:url" content="https://basaltui.com" /><meta property="og:description" content="d" /></head><body><div id="root">old</div></body></html>',
			homeCrawlPage(),
		);
		expect(applied).toContain(`<h1>${LANDING_HEADING}</h1>`);
		expect(applied).toContain(`<link rel="canonical" href="https://basaltui.com/" />`);
	});
});
