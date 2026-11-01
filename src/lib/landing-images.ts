/**
 * Responsive image sources for the landing page. Variants are produced by
 * scripts/generate-responsive-images.py and recorded in assets/responsive-images.json.
 */

export type LandingImageMode = "light" | "dark";
export type LandingImageFormat = "avif" | "webp";

/** Widths shipped for every template preview, in both formats; 3200 is the master. */
export const TEMPLATE_IMAGE_WIDTHS = [640, 960, 1200, 1600, 3200] as const;
export const TEMPLATE_MASTER_WIDTH = 3200;

/** The hero preview spans the page container; the template cards are a 3-up grid. */
export const HERO_IMAGE_SIZES = "(min-width: 1600px) 1456px, 91vw";
export const CARD_IMAGE_SIZES =
	"(max-width: 30rem) 87vw, (max-width: 47.5rem) 45vw, (max-width: 100rem) 28vw, 28rem";

/** The hero preview is the landing page's largest contentful paint on mobile and desktop. */
export const HERO_TEMPLATE_IMAGE = "dashboard";

export function templateImageUrl(
	name: string,
	mode: LandingImageMode,
	width: number,
	format: LandingImageFormat,
): string {
	const suffix = width === TEMPLATE_MASTER_WIDTH ? "" : `-${width}`;
	return `/landing/${name}-${mode}${suffix}.${format}`;
}

export function templateSrcSet(
	name: string,
	mode: LandingImageMode,
	format: LandingImageFormat,
): string {
	return TEMPLATE_IMAGE_WIDTHS.map(
		(width) => `${templateImageUrl(name, mode, width, format)} ${width}w`,
	).join(", ");
}

export const TOWER_IMAGE_WIDTHS = [480, 720, 960, 1280] as const;
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

const PRELOAD_MEDIA: Record<LandingImageMode, string> = {
	light: "(prefers-color-scheme: light)",
	dark: "(prefers-color-scheme: dark)",
};

/**
 * Preload hints for the hero preview, emitted only into the homepage document. They mirror the
 * AVIF `<source>` exactly so the browser reuses the preloaded response instead of fetching twice.
 */
export function heroPreloadLinks(): string[] {
	return (["light", "dark"] as const).map(
		(mode) =>
			`<link rel="preload" as="image" type="image/avif" fetchpriority="high" imagesrcset="${templateSrcSet(HERO_TEMPLATE_IMAGE, mode, "avif")}" imagesizes="${HERO_IMAGE_SIZES}" media="${PRELOAD_MEDIA[mode]}" />`,
	);
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
