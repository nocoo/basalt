import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LANDING_HEADING } from "../src/lib/landing";
import { SHOWCASE_PATHS } from "../src/lib/site";
import { CATALOG } from "../src/pages/ui/catalog";
import { fileForPath, prerenderHtml } from "./prerender";

const TEMPLATE =
	'<!doctype html><html><head><title>basalt.</title><meta name="description" content="d" /><link rel="canonical" href="https://basaltui.com/" /><meta property="og:title" content="t" /><meta property="og:url" content="https://basaltui.com" /><meta property="og:description" content="d" /></head><body><div id="root">shell</div></body></html>';

describe("prerender", () => {
	it("writes real HTML and distinct metadata for every sitemap page", () => {
		const dist = mkdtempSync(path.join(tmpdir(), "basalt-prerender-"));
		const written = prerenderHtml(dist, TEMPLATE);
		expect(written).toContain(path.join(dist, "ui.html"));
		expect(written).toContain(path.join(dist, "ui/button.html"));
		const paths = [...SHOWCASE_PATHS, ...CATALOG.map((entry) => `/ui/${entry.slug}`)];
		expect(written).toHaveLength(paths.length);
		for (const route of paths) {
			const html = readFileSync(fileForPath(dist, route), "utf8");
			const document = new DOMParser().parseFromString(html, "text/html");
			expect(document.querySelectorAll("h1")).toHaveLength(1);
			expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
				`https://basaltui.com${route}`,
			);
			expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toBe(
				document.title,
			);
			if (route === "/") expect(document.querySelector("h1")?.textContent).toBe(LANDING_HEADING);
			else expect(document.querySelector("h1")?.textContent).not.toBe(LANDING_HEADING);
		}
		expect(readFileSync(fileForPath(dist, "/ui"), "utf8")).toContain(
			`href="/ui/${CATALOG[0].slug}"`,
		);
		expect(readFileSync(fileForPath(dist, "/dashboard"), "utf8")).toContain("dashboard-light.webp");
	});
});
