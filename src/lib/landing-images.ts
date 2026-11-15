/**
 * Responsive image sources for the dark-only landing page. Variants are produced by
 * scripts/generate-responsive-images.py and recorded in assets/responsive-images.json.
 */

export type LandingImageFormat = "avif" | "webp";

/** Widths shipped for every dark template preview, in both formats; 3200 is the master. */
export const TEMPLATE_IMAGE_WIDTHS = [640, 960, 1200, 1600, 3200] as const;
export const TEMPLATE_MASTER_WIDTH = 3200;
/** The template preview fills the showcase frame: full width on phones, ~55% of the row. */
export const TEMPLATE_IMAGE_SIZES = "(max-width: 62.5rem) 88vw, (max-width: 90rem) 52vw, 46rem";

export function templateImageUrl(name: string, width: number, format: LandingImageFormat): string {
	const suffix = width === TEMPLATE_MASTER_WIDTH ? "" : `-${width}`;
	return `/landing/${name}-dark${suffix}.${format}`;
}

export function templateSrcSet(name: string, format: LandingImageFormat): string {
	return TEMPLATE_IMAGE_WIDTHS.map(
		(width) => `${templateImageUrl(name, width, format)} ${width}w`,
	).join(", ");
}

export const TOWER_IMAGE_WIDTHS = [480, 600, 720, 960, 1280] as const;
export const TOWER_MASTER_WIDTH = 1280;
/** The tower fills its artwork column: most of a phone, about a third of a desktop row. */
export const TOWER_IMAGE_SIZES =
	"(max-width: 30rem) 82vw, (max-width: 47.5rem) 28.5rem, (max-width: 62.5rem) 49vw, (max-width: 100rem) 38vw, 38.5rem";

export function towerSrcSet(format: LandingImageFormat): string {
	return TOWER_IMAGE_WIDTHS.map((width) => {
		const suffix = width === TOWER_MASTER_WIDTH ? "" : `-${width}`;
		return `/landing/tower${suffix}.${format} ${width}w`;
	}).join(", ");
}

/** Generated photographs recorded in assets/landing/scenes.json. */
export const SCENES = {
	hero: { widths: [960, 1600, 2400, 2880], width: 2880, height: 1600, sizes: "100vw" },
	night: { widths: [960, 1600, 2400, 2880], width: 2880, height: 1600, sizes: "100vw" },
	dusk: {
		widths: [800, 1200, 1600, 2048],
		width: 2048,
		height: 1536,
		sizes: "(max-width: 62.5rem) 100vw, 60vw",
	},
	teal: { widths: [800, 1200, 1600, 2048], width: 2048, height: 1536, sizes: "100vw" },
} as const;
export type LandingScene = keyof typeof SCENES;

export function sceneImageUrl(scene: LandingScene, width: number, format: LandingImageFormat) {
	return `/landing/scene-${scene}-${width}.${format}`;
}

export function sceneSrcSet(scene: LandingScene, format: LandingImageFormat): string {
	return SCENES[scene].widths
		.map((width) => `${sceneImageUrl(scene, width, format)} ${width}w`)
		.join(", ");
}

/**
 * The hero photograph is the landing page's largest contentful paint. The preload mirrors the
 * AVIF `<source>` exactly so the browser reuses the preloaded response instead of fetching twice.
 */
export function heroPreloadLinks(): string[] {
	return [
		`<link rel="preload" as="image" type="image/avif" fetchpriority="high" imagesrcset="${sceneSrcSet("hero", "avif")}" imagesizes="${SCENES.hero.sizes}" />`,
	];
}

export const HERO_PRELOAD_START = "<!--landing:preload-->";
export const HERO_PRELOAD_END = "<!--/landing:preload-->";

export function heroPreloadBlock(): string {
	return [HERO_PRELOAD_START, ...heroPreloadLinks(), HERO_PRELOAD_END].join("\n    ");
}

/** Other prerendered pages reuse the homepage document as a template; drop its hero hints. */
export function stripHeroPreload(html: string): string {
	return html.replace(/\s*<!--landing:preload-->[\s\S]*?<!--\/landing:preload-->/g, "");
}
