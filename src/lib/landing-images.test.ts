import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { applyCrawlPage, homeCrawlPage, uiIndexCrawlPage } from "./crawl";
import { LANDING_TEMPLATES } from "./landing";
import { applyLandingToIndexHtml } from "./landing-document";
import {
	HERO_IMAGE_SIZES,
	HERO_PRELOAD_END,
	HERO_PRELOAD_START,
	heroPreloadBlock,
	heroPreloadLinks,
	PHONE_SCENE_MEDIA,
	sceneBackgroundPreloadLinks,
	stripHeroPreload,
	TEMPLATE_IMAGE_WIDTHS,
	TOWER_IMAGE_WIDTHS,
	templateImageUrl,
	templateSrcSet,
	towerSrcSet,
} from "./landing-images";

const publicFile = (url: string) => resolve(__dirname, "../../public", url.slice(1));
const srcSetUrls = (srcSet: string) => srcSet.split(", ").map((entry) => entry.split(" ")[0]);

describe("landing image variants", () => {
	it("names the 3200w master without a width suffix", () => {
		expect(templateImageUrl("dashboard", "light", 3200, "avif")).toBe(
			"/landing/dashboard-light.avif",
		);
		expect(templateImageUrl("dashboard", "dark", 960, "webp")).toBe(
			"/landing/dashboard-dark-960.webp",
		);
		expect(towerSrcSet("webp")).toContain("/landing/tower.webp 1280w");
		expect(towerSrcSet("avif")).toContain("/landing/tower-480.avif 480w");
	});

	it("ships every referenced template and tower variant in public/", () => {
		const urls = [
			...LANDING_TEMPLATES.flatMap((template) =>
				(["light", "dark"] as const).flatMap((mode) =>
					(["avif", "webp"] as const).flatMap((format) =>
						srcSetUrls(templateSrcSet(template.image, mode, format)),
					),
				),
			),
			...srcSetUrls(towerSrcSet("avif")),
			...srcSetUrls(towerSrcSet("webp")),
		];
		expect(urls).toHaveLength(
			LANDING_TEMPLATES.length * 4 * TEMPLATE_IMAGE_WIDTHS.length + TOWER_IMAGE_WIDTHS.length * 2,
		);
		for (const url of urls) expect(existsSync(publicFile(url)), url).toBe(true);
	});

	it("keeps the generated manifest in step with the shipped files", () => {
		const manifest = JSON.parse(
			readFileSync(resolve(__dirname, "../../assets/responsive-images.json"), "utf8"),
		) as { files: Array<{ path: string; bytes: number }> };
		expect(manifest.files.length).toBeGreaterThan(0);
		for (const { path, bytes } of manifest.files) {
			expect(readFileSync(resolve(__dirname, "../..", path)).byteLength, path).toBe(bytes);
		}
	});
});

describe("scene background preload", () => {
	it("starts each ridge AVIF the stylesheet resolves to at low priority", () => {
		const css = readFileSync(resolve(__dirname, "../styles/landing.css"), "utf8");
		const links = sceneBackgroundPreloadLinks();
		expect(links).toHaveLength(4);
		expect(css).toContain(`@media ${PHONE_SCENE_MEDIA} {`);
		for (const link of links) {
			expect(link).toContain('fetchpriority="low"');
			const href = link.match(/href="([^"]+)"/)?.[1] ?? "";
			expect(existsSync(publicFile(href)), href).toBe(true);
			expect(css).toContain(`url("${href}") type("image/avif")`);
		}
		expect(links.filter((link) => link.includes(PHONE_SCENE_MEDIA))).toHaveLength(2);
	});
});

describe("hero preload", () => {
	it("preloads only the hero AVIF set, one per color scheme", () => {
		const links = heroPreloadLinks();
		expect(links).toHaveLength(2);
		for (const link of links) {
			expect(link).toContain('fetchpriority="high"');
			expect(link).toContain('type="image/avif"');
			expect(link).toContain(`imagesizes="${HERO_IMAGE_SIZES}"`);
		}
		expect(links[0]).toContain("dashboard-light-960.avif 960w");
		expect(links[1]).toContain("dashboard-dark-960.avif 960w");
	});

	it("is injected once into the homepage document and stripped elsewhere", () => {
		const template = readFileSync(resolve(__dirname, "../../index.html"), "utf8");
		const home = applyLandingToIndexHtml(stripHeroPreload(template));
		expect(home.split(HERO_PRELOAD_START)).toHaveLength(2);
		expect(applyLandingToIndexHtml(home)).toBe(home);
		expect(applyCrawlPage(home, homeCrawlPage())).toContain(HERO_PRELOAD_START);
		const other = applyCrawlPage(home, uiIndexCrawlPage([]));
		expect(other).not.toContain(HERO_PRELOAD_START);
		expect(other).not.toContain("dashboard-light-960.avif 960w");
	});

	it("falls back to the end of <head> without a font preload", () => {
		const html = applyLandingToIndexHtml(
			'<html><head><title>x</title></head><body><div id="root"></div></body></html>',
		);
		expect(html.indexOf(HERO_PRELOAD_END)).toBeLessThan(html.indexOf("</head>"));
		expect(stripHeroPreload(heroPreloadBlock())).toBe("");
	});
});
