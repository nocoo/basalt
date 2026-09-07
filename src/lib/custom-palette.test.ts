import { afterEach, expect, it, vi } from "vitest";
import {
	classicPaletteColors,
	hexToHsl,
	hslToHex,
	isHexColor,
	loadPalettePreference,
	PALETTE_STORAGE_KEY,
	paletteOverrides,
	parsePalettePreference,
	savePalettePreference,
	validPaletteColors,
} from "./custom-palette";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	localStorage.clear();
});

it("round-trips grayscale and every RGB hue sector without accepting CSS expressions", () => {
	for (const hex of [
		"#000000",
		"#ffffff",
		"#808080",
		"#ff0000",
		"#ffff00",
		"#00ff00",
		"#00ffff",
		"#0000ff",
		"#ff00ff",
		"#73c2fb",
	])
		expect(hslToHex(hexToHsl(hex))).toBe(hex);
	expect(isHexColor("#Ff00AA")).toBe(true);
	for (const invalid of ["red", "#fff", "#12345678", "var(--chart-1)", "#xyz123", null, 42])
		expect(isHexColor(invalid)).toBe(false);
	expect(() => hexToHsl("red")).toThrow("six-digit");
});

it("loads only a complete versioned twelve-color palette and strips unrecognized fields", () => {
	const colors = classicPaletteColors();
	expect(Object.keys(colors)).toHaveLength(12);
	expect(Object.keys(paletteOverrides(colors))).toHaveLength(12);
	const raw = JSON.stringify({
		version: 1,
		mode: "custom",
		colors: { ...colors, ignored: { light: "red", dark: "blue" } },
	});
	expect(parsePalettePreference(raw)).toEqual({ version: 1, mode: "custom", colors });
	const uppercase = JSON.stringify({
		version: 1,
		mode: "classic",
		colors: { ...colors, primary: { light: "#ABCDEF", dark: "#FEDCBA" } },
	});
	expect(parsePalettePreference(uppercase)?.colors.primary).toEqual({
		light: "#abcdef",
		dark: "#fedcba",
	});
	for (const raw of [
		null,
		"",
		"x".repeat(16385),
		"{",
		"null",
		"42",
		JSON.stringify({ version: 2, colors }),
		JSON.stringify({ version: 1, mode: "unknown", colors }),
		JSON.stringify({ version: 1, mode: "custom", colors: {} }),
	])
		expect(parsePalettePreference(raw)).toBeUndefined();
	for (const invalid of [
		undefined,
		null,
		"red",
		{},
		{ ...colors, primary: { light: "#fff", dark: "#ffffff" } },
		{ ...colors, primary: { light: "#ffffff", dark: "invalid" } },
	])
		expect(validPaletteColors(invalid)).toBe(false);
});

it("persists valid preferences and remains usable during storage failures and SSR", () => {
	const preference = {
		version: 1 as const,
		mode: "custom" as const,
		colors: classicPaletteColors(),
	};
	expect(loadPalettePreference().mode).toBe("classic");
	expect(savePalettePreference(preference)).toBe(true);
	expect(localStorage.getItem(PALETTE_STORAGE_KEY)).not.toBeNull();
	expect(loadPalettePreference()).toEqual(preference);
	vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
		throw new Error("denied");
	});
	vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
		throw new Error("quota");
	});
	expect(loadPalettePreference().mode).toBe("classic");
	expect(savePalettePreference(preference)).toBe(false);
	vi.stubGlobal("window", undefined);
	expect(loadPalettePreference().mode).toBe("classic");
	expect(savePalettePreference(preference)).toBe(false);
});
