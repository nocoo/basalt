import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { applyCrawlPage, homeCrawlPage, uiIndexCrawlPage } from "./crawl";
import { LANDING_TEMPLATES } from "./landing";
import { applyLandingToIndexHtml } from "./landing-document";
import {
	HERO_PRELOAD_END,
	HERO_PRELOAD_START,
	heroPreloadBlock,
	heroPreloadLinks,
	type LandingScene,
	SCENES,
	sceneImageUrl,
	sceneSrcSet,
	stripHeroPreload,
	TEMPLATE_IMAGE_WIDTHS,
	TOWER_IMAGE_WIDTHS,
	templateImageUrl,
	templateSrcSet,
	towerSrcSet,
} from "./landing-images";

const root = resolve(__dirname, "../..");
const publicFile = (url: string) => resolve(root, "public", url.slice(1));
const srcSetUrls = (srcSet: string) => srcSet.split(", ").map((entry) => entry.split(" ")[0]);
const sceneNames = Object.keys(SCENES) as LandingScene[];

describe("landing image variants", () => {
	it("names the 3200w master without a width suffix", () => {
		expect(templateImageUrl("dashboard", 3200, "avif")).toBe("/landing/dashboard-dark.avif");
		expect(templateImageUrl("dashboard", 960, "webp")).toBe("/landing/dashboard-dark-960.webp");
		expect(sceneImageUrl("hero", 1600, "avif")).toBe("/landing/scene-hero-1600.avif");
		expect(towerSrcSet("webp")).toContain("/landing/tower.webp 1280w");
		expect(towerSrcSet("avif")).toContain("/landing/tower-480.avif 480w");
	});

	it("ships every referenced template, scene and tower variant in public/", () => {
		const urls = [
			...LANDING_TEMPLATES.flatMap((template) =>
				(["avif", "webp"] as const).flatMap((format) =>
					srcSetUrls(templateSrcSet(template.image, format)),
				),
			),
			...sceneNames.flatMap((scene) =>
				(["avif", "webp"] as const).flatMap((format) => srcSetUrls(sceneSrcSet(scene, format))),
			),
			...srcSetUrls(towerSrcSet("avif")),
			...srcSetUrls(towerSrcSet("webp")),
		];
		const sceneVariants = sceneNames.reduce((sum, scene) => sum + SCENES[scene].widths.length, 0);
		expect(urls).toHaveLength(
			LANDING_TEMPLATES.length * 2 * TEMPLATE_IMAGE_WIDTHS.length +
				sceneVariants * 2 +
				TOWER_IMAGE_WIDTHS.length * 2,
		);
		for (const url of urls) expect(existsSync(publicFile(url)), url).toBe(true);
	});

	it("derives scenes from the recorded generated masters at their native size", () => {
		const record = JSON.parse(
			readFileSync(resolve(root, "assets/landing/scenes.json"), "utf8"),
		) as {
			scenes: Array<{
				id: LandingScene;
				master: string;
				nativeSize: [number, number];
				widths: number[];
			}>;
		};
		expect(record.scenes.map((scene) => scene.id).sort()).toEqual([...sceneNames].sort());
		for (const scene of record.scenes) {
			expect(existsSync(resolve(root, scene.master)), scene.master).toBe(true);
			expect(scene.widths).toEqual([...SCENES[scene.id].widths]);
			expect(scene.nativeSize).toEqual([SCENES[scene.id].width, SCENES[scene.id].height]);
		}
	});

	it("keeps the generated manifest in step with the shipped files", () => {
		const manifest = JSON.parse(
			readFileSync(resolve(root, "assets/responsive-images.json"), "utf8"),
		) as { files: Array<{ path: string; bytes: number }> };
		expect(manifest.files.length).toBeGreaterThan(0);
		for (const { path, bytes } of manifest.files) {
			expect(readFileSync(resolve(root, path)).byteLength, path).toBe(bytes);
		}
	});
});

describe("hero preload", () => {
	it("preloads the hero photograph AVIF with the same srcset and sizes as its <source>", () => {
		const links = heroPreloadLinks();
		expect(links).toHaveLength(1);
		expect(links[0]).toContain('fetchpriority="high"');
		expect(links[0]).toContain('type="image/avif"');
		expect(links[0]).toContain(`imagesrcset="${sceneSrcSet("hero", "avif")}"`);
		expect(links[0]).toContain(`imagesizes="${SCENES.hero.sizes}"`);
	});

	it("is injected once into the homepage document and stripped elsewhere", () => {
		const template = readFileSync(resolve(root, "index.html"), "utf8");
		const home = applyLandingToIndexHtml(stripHeroPreload(template));
		expect(home.split(HERO_PRELOAD_START)).toHaveLength(2);
		expect(applyLandingToIndexHtml(home)).toBe(home);
		expect(applyCrawlPage(home, homeCrawlPage())).toContain(HERO_PRELOAD_START);
		const other = applyCrawlPage(home, uiIndexCrawlPage([]));
		expect(other).not.toContain(HERO_PRELOAD_START);
		expect(other).not.toContain("scene-hero-960.avif 960w");
	});

	it("falls back to the end of <head> without a font preload", () => {
		const html = applyLandingToIndexHtml(
			'<html><head><title>x</title></head><body><div id="root"></div></body></html>',
		);
		expect(html.indexOf(HERO_PRELOAD_END)).toBeLessThan(html.indexOf("</head>"));
		expect(stripHeroPreload(heroPreloadBlock())).toBe("");
	});
});
