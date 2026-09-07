import { ACCENT_SWATCHES } from "@nocoo/basalt/providers/accent";

export const PALETTE_STORAGE_KEY = "basalt-palette-v1";
export type CustomPaletteColors = Record<string, { light: string; dark: string }>;
export type PalettePreference = {
	version: 1;
	mode: "classic" | "custom";
	colors: CustomPaletteColors;
};

export function isHexColor(value: unknown): value is string {
	return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}

export function hexToHsl(hex: string): string {
	if (!isHexColor(hex)) throw new Error("Use a six-digit hex color.");
	const [r, g, b] = [1, 3, 5].map(
		(start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255,
	);
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b),
		delta = max - min;
	const light = (max + min) / 2;
	const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * light - 1));
	const hue =
		delta === 0
			? 0
			: max === r
				? ((g - b) / delta + 6) % 6
				: max === g
					? (b - r) / delta + 2
					: (r - g) / delta + 4;
	return `${Number((hue * 60).toFixed(2))} ${Number((saturation * 100).toFixed(2))}% ${Number((light * 100).toFixed(2))}%`;
}

export function hslToHex(hsl: string): string {
	const [h, saturation, lightness] = hsl.split(/\s+/).map(Number.parseFloat);
	const s = saturation / 100,
		l = lightness / 100,
		a = s * Math.min(l, 1 - l);
	const channel = (n: number) => {
		const k = (n + h / 30) % 12;
		return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
			.toString(16)
			.padStart(2, "0");
	};
	return `#${channel(0)}${channel(8)}${channel(4)}`;
}

export function classicPaletteColors(): CustomPaletteColors {
	return Object.fromEntries(
		ACCENT_SWATCHES.map((swatch) => [
			swatch.id,
			{ light: hslToHex(swatch.light), dark: hslToHex(swatch.dark) },
		]),
	);
}

export function validPaletteColors(colors: unknown): colors is CustomPaletteColors {
	if (!colors || typeof colors !== "object") return false;
	return ACCENT_SWATCHES.every(({ id }) => {
		const pair = (colors as CustomPaletteColors)[id];
		return pair && isHexColor(pair.light) && isHexColor(pair.dark);
	});
}

export function parsePalettePreference(raw: string | null): PalettePreference | undefined {
	if (!raw || raw.length > 16_384) return undefined;
	try {
		const parsed = JSON.parse(raw) as PalettePreference | null;
		if (
			parsed?.version !== 1 ||
			!["classic", "custom"].includes(parsed.mode) ||
			!validPaletteColors(parsed.colors)
		)
			return undefined;
		return {
			version: 1,
			mode: parsed.mode,
			colors: Object.fromEntries(
				ACCENT_SWATCHES.map(({ id }) => [
					id,
					{
						light: parsed.colors[id].light.toLowerCase(),
						dark: parsed.colors[id].dark.toLowerCase(),
					},
				]),
			),
		};
	} catch {
		return undefined;
	}
}

export function loadPalettePreference(): PalettePreference {
	try {
		const stored = parsePalettePreference(
			typeof window === "undefined" ? null : window.localStorage.getItem(PALETTE_STORAGE_KEY),
		);
		if (stored) return stored;
	} catch {
		/* A denied read must not block the palette editor. */
	}
	return { version: 1, mode: "classic", colors: classicPaletteColors() };
}

export function savePalettePreference(preference: PalettePreference): boolean {
	try {
		window.localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(preference));
		return true;
	} catch {
		return false;
	}
}

export function paletteOverrides(colors: CustomPaletteColors) {
	return Object.fromEntries(
		ACCENT_SWATCHES.map(({ id }) => [
			id,
			{ light: hexToHsl(colors[id].light), dark: hexToHsl(colors[id].dark) },
		]),
	);
}
