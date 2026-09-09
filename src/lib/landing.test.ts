import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyCrawlPage, catalogCrawlPage, homeCrawlPage, uiIndexCrawlPage } from "./crawl";
import { LANDING_HEADING, LANDING_RELATED_LINKS, LANDING_TEMPLATES } from "./landing";
import {
	applyLandingToIndexHtml,
	renderLandingBody,
	requiredLandingSnippets,
} from "./landing-document";
import { SITE } from "./site";

function parse(html: string) {
	return new DOMParser().parseFromString(html, "text/html");
}

describe("landing document", () => {
	it("exposes the complete landing content and template destinations without JavaScript", () => {
		const body = renderLandingBody();
		const document = parse(body);
		expect(document.querySelectorAll("h1")).toHaveLength(1);
		expect(document.querySelector("h1")?.textContent).toBe(LANDING_HEADING);
		expect(document.querySelector("#main-content")).not.toBeNull();
		expect(document.querySelectorAll("details")).toHaveLength(4);
		expect(document.querySelector('[href="#main-content"]')?.textContent).toBe(
			"Skip to main content",
		);
		for (const template of LANDING_TEMPLATES) {
			expect(
				document.querySelector(`.landing-template-link[href="${template.href}"]`),
			).not.toBeNull();
		}
		for (const url of [
			SITE.npm,
			SITE.github,
			SITE.portfolio,
			...LANDING_RELATED_LINKS.map((link) => link.href),
		]) {
			expect(body).toContain(url);
		}
	});

	it("keeps index.html synchronized with the shared page and canonical metadata", () => {
		const html = readFileSync("index.html", "utf8");
		for (const snippet of requiredLandingSnippets()) expect(html).toContain(snippet);
		expect(html).toContain(renderLandingBody());
		expect(applyLandingToIndexHtml(html)).toBe(html);
	});

	it("removes the old global width styles on regeneration and loads CSS without JavaScript", () => {
		const html = applyLandingToIndexHtml(
			'<!doctype html><html><head><title>basalt.</title><style id="basalt-landing-css">header,main,footer{max-width:720px}</style></head><body><div id="root"></div></body></html>',
		);
		expect(html).not.toContain("basalt-landing-css");
		expect(html).not.toContain("max-width:720px");
		const document = parse(html);
		expect(document.querySelector('link[rel="stylesheet"]')?.getAttribute("href")).toBe(
			"/src/index.css",
		);
		expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
			"https://basaltui.com/",
		);
		expect(document.querySelector("h1")?.textContent).toBe(LANDING_HEADING);
		expect(applyLandingToIndexHtml(html)).toBe(html);
	});

	it("writes scoped, escaped page-specific crawl HTML for catalog surfaces", () => {
		const page = catalogCrawlPage("badge", "Tag $& <Badge>", 'A "label" & <tag>.');
		const document = parse(page.html);
		expect(document.querySelector("[data-crawl-page] main")).not.toBeNull();
		expect(document.querySelector("h1")?.textContent).toBe("Tag $& <Badge>");
		expect(document.body.textContent).toContain('A "label" & <tag>.');
		expect(document.querySelector("badge, tag")).toBeNull();
		expect(catalogCrawlPage("text", "Text").html).toContain("@nocoo/basalt");
		const marked = applyCrawlPage(
			'<html><head><title>old</title></head><body><div id="root"><!--seo:body-->old<!--/seo:body--></div></body></html>',
			page,
		);
		expect(parse(marked).querySelector("h1")?.textContent).toBe("Tag $& <Badge>");
		expect(parse(marked).title).toBe("Tag $& <Badge> · basalt.");
		expect(
			parse(uiIndexCrawlPage([{ slug: "button", name: "Button" }]).html).querySelector(
				'[href="/ui/button"]',
			),
		).not.toBeNull();
		const applied = applyCrawlPage(
			'<html><head></head><body><div id="root">old</div></body></html>',
			homeCrawlPage(),
		);
		expect(parse(applied).querySelector("h1")?.textContent).toBe(LANDING_HEADING);
	});
});
