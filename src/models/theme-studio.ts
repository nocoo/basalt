export const STUDIO_ACCENTS = [
	"primary",
	"sky",
	"teal",
	"green",
	"lime",
	"amber",
	"orange",
	"red",
	"rose",
	"purple",
	"indigo",
	"gray",
] as const;
export const SURFACE_TINTS = ["neutral", "warm", "cool"] as const;
export const RADIUS_SCALES = ["default", "sharp", "soft"] as const;
export const CHART_MODES = ["categorical", "monochrome"] as const;
export const FONT_PAIRINGS = ["default", "sans", "technical"] as const;

export type StudioAccent = (typeof STUDIO_ACCENTS)[number];
export type StudioMode = "light" | "dark";
export interface ThemeStudioOptions {
	surfaceTint: (typeof SURFACE_TINTS)[number];
	radius: (typeof RADIUS_SCALES)[number];
	chartMode: (typeof CHART_MODES)[number];
	fontPairing: (typeof FONT_PAIRINGS)[number];
}
export interface StudioPresetState extends ThemeStudioOptions {
	accent: StudioAccent;
}
export type StudioPresetId =
	| "default"
	| "graphite"
	| "limestone"
	| "ops"
	| "editorial"
	| "terminal";
export interface StudioSwatch {
	id: string;
	light: string;
	dark: string;
}

export const DEFAULT_STUDIO_STATE: StudioPresetState = {
	accent: "primary",
	surfaceTint: "neutral",
	radius: "default",
	chartMode: "categorical",
	fontPairing: "default",
};
export const STUDIO_PRESETS: readonly {
	id: StudioPresetId;
	label: string;
	options: StudioPresetState;
}[] = [
	{ id: "default", label: "Basalt Default", options: DEFAULT_STUDIO_STATE },
	{
		id: "graphite",
		label: "Pure Graphite",
		options: {
			accent: "gray",
			surfaceTint: "neutral",
			radius: "default",
			chartMode: "monochrome",
			fontPairing: "default",
		},
	},
	{
		id: "limestone",
		label: "Warm Limestone",
		options: {
			accent: "amber",
			surfaceTint: "warm",
			radius: "soft",
			chartMode: "categorical",
			fontPairing: "default",
		},
	},
	{
		id: "ops",
		label: "Signal Ops",
		options: {
			accent: "teal",
			surfaceTint: "cool",
			radius: "sharp",
			chartMode: "monochrome",
			fontPairing: "technical",
		},
	},
	{
		id: "editorial",
		label: "Soft Editorial",
		options: {
			accent: "indigo",
			surfaceTint: "warm",
			radius: "soft",
			chartMode: "categorical",
			fontPairing: "sans",
		},
	},
	{
		id: "terminal",
		label: "Sharp Terminal",
		options: {
			accent: "green",
			surfaceTint: "neutral",
			radius: "sharp",
			chartMode: "monochrome",
			fontPairing: "technical",
		},
	},
];

const DEFAULT_SWATCHES: readonly StudioSwatch[] = [
	{ id: "primary", light: "204 88% 62%", dark: "204 90% 70%" },
	{ id: "sky", light: "191 79% 70%", dark: "191 79% 74%" },
	{ id: "teal", light: "182 62% 47%", dark: "182 62% 63%" },
	{ id: "green", light: "113 58% 62%", dark: "113 58% 70%" },
	{ id: "lime", light: "79 70% 64%", dark: "79 70% 70%" },
	{ id: "amber", light: "49 100% 69%", dark: "49 100% 73%" },
	{ id: "orange", light: "27 95% 65%", dark: "27 95% 72%" },
	{ id: "red", light: "5 85% 66%", dark: "5 85% 73%" },
	{ id: "rose", light: "345 88% 72%", dark: "345 88% 77%" },
	{ id: "purple", light: "280 53% 71%", dark: "280 53% 77%" },
	{ id: "indigo", light: "237 66% 69%", dark: "237 66% 77%" },
	{ id: "gray", light: "210 20% 87%", dark: "210 20% 88%" },
];

const SURFACES = {
	warm: {
		light: ["40 14% 95.7%", "40 12% 98%", "40 30% 99.2%", "40 30% 99.8%", "40 12% 89%"],
		dark: ["35 8% 9%", "35 7% 10.6%", "35 6% 12.2%", "35 6% 14%", "35 7% 16%"],
	},
	cool: {
		light: ["215 12% 95.7%", "215 10% 98%", "215 30% 99.2%", "215 30% 99.8%", "215 10% 89%"],
		dark: ["215 8% 9%", "215 7% 10.6%", "215 6% 12.2%", "215 6% 14%", "215 7% 16%"],
	},
} as const;
const RADIUS = {
	sharp: ["0.125rem", "0.25rem", "0.375rem"],
	soft: ["0.375rem", "0.625rem", "1rem"],
} as const;
const FONT = {
	sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	technical: '"JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace',
} as const;

const FIELDS = [STUDIO_ACCENTS, SURFACE_TINTS, RADIUS_SCALES, CHART_MODES, FONT_PAIRINGS] as const;
export function encodeStudioPreset(options: StudioPresetState): string {
	return [
		options.accent,
		options.surfaceTint,
		options.radius,
		options.chartMode,
		options.fontPairing,
	]
		.map((value, index) => (FIELDS[index] as readonly string[]).indexOf(value).toString(36))
		.join("");
}

export function decodeStudioPreset(encoded: string | null): StudioPresetState {
	if (!encoded || !/^[0-9a-z]{5}$/.test(encoded)) return { ...DEFAULT_STUDIO_STATE };
	const indices = Array.from(encoded, (character) => Number.parseInt(character, 36));
	if (indices.some((index, position) => index >= FIELDS[position].length))
		return { ...DEFAULT_STUDIO_STATE };
	return {
		accent: STUDIO_ACCENTS[indices[0]],
		surfaceTint: SURFACE_TINTS[indices[1]],
		radius: RADIUS_SCALES[indices[2]],
		chartMode: CHART_MODES[indices[3]],
		fontPairing: FONT_PAIRINGS[indices[4]],
	};
}

export function matchingPresetId(options: StudioPresetState): StudioPresetId | "custom" {
	const encoded = encodeStudioPreset(options);
	return (
		STUDIO_PRESETS.find((preset) => encodeStudioPreset(preset.options) === encoded)?.id ?? "custom"
	);
}

type Rgb = [number, number, number];
function hslRgb(hue: number, saturation: number, lightness: number): Rgb {
	const amplitude = saturation * Math.min(lightness, 1 - lightness);
	const channel = (offset: number) => {
		const value = (offset + hue / 30) % 12;
		return 255 * (lightness - amplitude * Math.max(-1, Math.min(value - 3, 9 - value, 1)));
	};
	return [channel(0), channel(8), channel(4)];
}
function luminance(rgb: Rgb): number {
	const [red, green, blue] = rgb.map((value) => {
		const channel = value / 255;
		return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
function contrast(first: Rgb, second: Rgb): number {
	const values = [luminance(first), luminance(second)];
	return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}
function semanticAccent(
	swatch: StudioSwatch,
	mode: StudioMode,
): { primary: string; foreground: string } {
	const [hue, saturationPercent, originalLightness] = swatch[mode]
		.split(/\s+/)
		.map(Number.parseFloat);
	const saturation = saturationPercent / 100;
	const dark = mode === "dark";
	const surfaces: Rgb[] = dark
		? [
				[23, 23, 23],
				[27, 27, 27],
				[31, 31, 31],
				[36, 36, 36],
			]
		: [
				[238, 239, 242],
				[246, 247, 248],
				[252, 252, 253],
				[255, 255, 255],
			];
	const text: Rgb = dark ? [26, 26, 26] : [255, 255, 255];
	let primary = swatch[mode];
	for (
		let lightness = dark
			? Math.max(Math.round(originalLightness), 45)
			: Math.min(Math.round(originalLightness), 60);
		dark ? lightness <= 85 : lightness >= 15;
		lightness += dark ? 1 : -1
	) {
		const color = hslRgb(hue, saturation, lightness / 100);
		if (surfaces.some((surface) => contrast(color, surface) < 4.55) || contrast(color, text) < 4.55)
			continue;
		if (
			surfaces.some(
				(surface) =>
					contrast(
						color.map((channel, index) => channel * 0.9 + surface[index] * 0.1) as Rgb,
						text,
					) < 4.55,
			)
		)
			continue;
		primary = `${hue} ${Math.round(saturation * 100)}% ${lightness}%`;
		break;
	}
	const [resolvedHue, resolvedSaturation, resolvedLightness] = primary
		.split(/\s+/)
		.map(Number.parseFloat);
	const rgb = hslRgb(resolvedHue, resolvedSaturation / 100, resolvedLightness / 100);
	return {
		primary,
		foreground:
			contrast(rgb, [26, 26, 26]) >= contrast(rgb, [255, 255, 255]) ? "0 0% 10%" : "0 0% 100%",
	};
}

export function computeStudioScopedVars(
	options: StudioPresetState,
	mode: StudioMode,
	swatches: readonly StudioSwatch[] = DEFAULT_SWATCHES,
): Record<string, string> {
	const vars: Record<string, string> = {};
	if (options.surfaceTint !== "neutral") {
		const [background, card, secondary, bright, border] = SURFACES[options.surfaceTint][mode];
		Object.assign(vars, {
			"--basalt-background": background,
			"--basalt-card": card,
			"--basalt-secondary": secondary,
			"--basalt-bright": bright,
			"--basalt-border": border,
		});
	}
	if (options.radius !== "default") {
		const [small, medium, large] = RADIUS[options.radius];
		Object.assign(vars, {
			"--basalt-radius-sm": small,
			"--basalt-radius-md": medium,
			"--basalt-radius-lg": large,
			"--basalt-radius-island": large,
			"--basalt-radius-card": large,
			"--basalt-radius-widget": medium,
		});
	}
	if (options.fontPairing !== "default") vars["--basalt-font-display"] = FONT[options.fontPairing];
	const swatch =
		swatches.find((item) => item.id === options.accent) ??
		DEFAULT_SWATCHES.find((item) => item.id === options.accent) ??
		DEFAULT_SWATCHES[0];
	const accent = semanticAccent(swatch, mode);
	const baseline = semanticAccent(DEFAULT_SWATCHES[0], mode);
	if (accent.primary !== baseline.primary) {
		vars["--basalt-primary"] = accent.primary;
		vars["--basalt-primary-foreground"] = accent.foreground;
	}
	if (options.chartMode === "monochrome") {
		const tones =
			mode === "light"
				? ["0 0% 30%", "0 0% 38%", "0 0% 46%", "0 0% 54%"]
				: ["0 0% 80%", "0 0% 70%", "0 0% 60%", "0 0% 50%"];
		Object.assign(vars, {
			"--basalt-chart-1": "var(--basalt-primary)",
			"--basalt-chart-2": tones[0],
			"--basalt-chart-3": tones[1],
			"--basalt-chart-4": tones[2],
			"--basalt-chart-5": tones[3],
		});
	}
	return vars;
}

export function generateThemeCssDiff(
	options: StudioPresetState,
	swatches?: readonly StudioSwatch[],
): string {
	const light = computeStudioScopedVars(options, "light", swatches);
	const dark = computeStudioScopedVars(options, "dark", swatches);
	for (const [mode, vars] of [
		["light", light],
		["dark", dark],
	] as const) {
		const baseline = semanticAccent(DEFAULT_SWATCHES[0], mode);
		if (vars["--basalt-primary-foreground"] === baseline.foreground)
			delete vars["--basalt-primary-foreground"];
	}
	const darkOverrides = Object.fromEntries(
		Object.entries(dark).filter(
			([key, value]) => value !== light[key] || key.startsWith("--basalt-chart-"),
		),
	);
	const block = (selector: string, vars: Record<string, string>) =>
		Object.keys(vars).length
			? `${selector} {\n${Object.entries(vars)
					.map(([key, value]) => `  ${key}: ${value};`)
					.join("\n")}\n}\n`
			: "";
	const css = [block(":root", light), block('.dark,\n[data-mode="dark"]', darkOverrides)]
		.filter(Boolean)
		.join("\n");
	return css || "/* Default Basalt tokens — no overrides required. */\n";
}
