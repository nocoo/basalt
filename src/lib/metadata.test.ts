import { describe, expect, it } from "vitest";
import { applyMetadataToHtml, pageMetadata, pageMetaTags } from "./metadata";
import { SITE } from "./site";

describe("page metadata", () => {
	it("describes the landing, catalog, and individual examples without reusing the home description", () => {
		expect(pageMetadata("/").title).toBe(SITE.homeTitle);
		expect(pageMetadata("/").description).toBe(SITE.description);
		expect(pageMetadata("/ui/", "Component library").path).toBe("/ui");
		for (const [path, name] of [
			["/ui", "Component library"],
			["/dashboard", "Dashboard"],
			["/banking", "Banking & Wealth"],
			["/network", "Network Ops"],
			["/ui/button", "Button"],
			["/forms", "Forms"],
		]) {
			const page = pageMetadata(path, name);
			expect(page.title).toBe(`${name} · basalt.`);
			expect(page.description).not.toBe(SITE.description);
			expect(pageMetaTags(page).find((tag) => tag.key === "og:url")?.content).toBe(
				`https://basaltui.com${path}`,
			);
		}
		expect(pageMetadata("/ui/custom").description).toContain("Component");
		expect(pageMetadata("/custom").description).toContain("Interface");
	});

	it("synchronizes search, social, and structured metadata and safely escapes catalog text", () => {
		const page = pageMetadata("/ui/badge", 'Badge $& "status" <label>');
		const template =
			'<html><head><title>old</title><meta name="description" content="old" /><meta property="og:title" content="old" /><meta name="twitter:title" content="old" /><script type="application/ld+json">{}</script></head><body></body></html>';
		const html = applyMetadataToHtml(template, page);
		const document = new DOMParser().parseFromString(html, "text/html");
		expect(document.title).toBe(page.title);
		for (const tag of pageMetaTags(page)) {
			const nodes = document.querySelectorAll(`meta[${tag.attribute}="${tag.key}"]`);
			expect(nodes).toHaveLength(1);
			expect(nodes[0].getAttribute("content")).toBe(tag.content);
		}
		expect(document.querySelector("label")).toBeNull();
		expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
			"https://basaltui.com/ui/badge",
		);
		const graph = JSON.parse(
			document.querySelector('script[type="application/ld+json"]')?.textContent || "{}",
		);
		expect(graph["@graph"]).toContainEqual(
			expect.objectContaining({
				"@type": "WebPage",
				url: "https://basaltui.com/ui/badge",
				name: page.title,
			}),
		);
		expect(applyMetadataToHtml(html, page)).toBe(html);
	});
});
