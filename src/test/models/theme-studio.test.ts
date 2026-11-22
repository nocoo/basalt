import { ACCENT_SWATCHES, applyAccent } from "@nocoo/basalt/providers/accent";
import { describe, expect, it } from "vitest";
import {
	computeStudioScopedVars,
	DEFAULT_STUDIO_STATE,
	decodeStudioPreset,
	encodeStudioPreset,
	generateThemeCssDiff,
	matchingPresetId,
	STUDIO_ACCENTS,
	STUDIO_PRESETS,
	type StudioMode,
	type StudioPresetState,
} from "@/models/theme-studio";

function luminance(hsl: string): number {
	const [hue, saturation, lightness] = hsl.split(/\s+/).map(Number.parseFloat);
	const light = lightness / 100;
	const amplitude = (saturation / 100) * Math.min(light, 1 - light);
	const component = (offset: number) => {
		const value = (offset + hue / 30) % 12;
		const rgb = light - amplitude * Math.max(-1, Math.min(value - 3, 9 - value, 1));
		return rgb <= 0.04045 ? rgb / 12.92 : ((rgb + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * component(0) + 0.7152 * component(8) + 0.0722 * component(4);
}
function contrast(first: string, second: string): number {
	const values = [luminance(first), luminance(second)];
	return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}
function rgb(hsl: string): number[] {
	const [hue, saturation, lightness] = hsl.split(/\s+/).map(Number.parseFloat);
	const light = lightness / 100;
	const amplitude = (saturation / 100) * Math.min(light, 1 - light);
	return [0, 8, 4].map((offset) => {
		const value = (offset + hue / 30) % 12;
		return Math.round(255 * (light - amplitude * Math.max(-1, Math.min(value - 3, 9 - value, 1))));
	});
}

describe("theme studio model", () => {
	it("round trips every preset and rejects malformed or out-of-range values", () => {
		expect(STUDIO_ACCENTS).toEqual(ACCENT_SWATCHES.map((swatch) => swatch.id));
		for (const preset of STUDIO_PRESETS) {
			expect(decodeStudioPreset(encodeStudioPreset(preset.options))).toEqual(preset.options);
			expect(matchingPresetId(preset.options)).toBe(preset.id);
		}
		for (const accent of STUDIO_ACCENTS) {
			const state = {
				...DEFAULT_STUDIO_STATE,
				accent,
				surfaceTint: "cool" as const,
				radius: "soft" as const,
				chartMode: "monochrome" as const,
				fontPairing: "sans" as const,
			};
			expect(decodeStudioPreset(encodeStudioPreset(state))).toEqual(state);
		}
		for (const input of [null, "", "0000", "000000", "0000!", "z0000", "000z0"])
			expect(decodeStudioPreset(input)).toEqual(DEFAULT_STUDIO_STATE);
		expect(matchingPresetId({ ...DEFAULT_STUDIO_STATE, radius: "soft" })).toBe("custom");
	});
	it("keeps tinted surfaces ascending and readable in both modes", () => {
		for (const surfaceTint of ["warm", "cool"] as const)
			for (const mode of ["light", "dark"] as const) {
				const vars = computeStudioScopedVars({ ...DEFAULT_STUDIO_STATE, surfaceTint }, mode);
				const surfaces = [
					vars["--basalt-background"],
					vars["--basalt-card"],
					vars["--basalt-secondary"],
					vars["--basalt-bright"],
				];
				for (let index = 1; index < surfaces.length; index += 1)
					expect(luminance(surfaces[index])).toBeGreaterThan(luminance(surfaces[index - 1]));
				const card = rgb(vars["--basalt-card"]);
				expect(surfaceTint === "warm" ? card[0] : card[2]).toBeGreaterThan(
					surfaceTint === "warm" ? card[2] : card[0],
				);
				for (const surface of surfaces)
					expect(
						contrast(surface, mode === "light" ? "0 0% 10%" : "0 0% 93%"),
					).toBeGreaterThanOrEqual(4.5);
			}
	});
	it("matches the built-in accent provider in both modes", () => {
		const root = document.documentElement;
		const style = root.getAttribute("style");
		const previous = root.dataset.accent;
		try {
			for (const mode of ["light", "dark"] as const) {
				applyAccent("primary", mode === "dark");
				const baselinePrimary = root.style.getPropertyValue("--basalt-primary");
				const baselineForeground = root.style.getPropertyValue("--basalt-primary-foreground");
				const baselineLink = root.style.getPropertyValue("--basalt-link");
				const baselineRing = root.style.getPropertyValue("--basalt-ring");
				for (const accent of STUDIO_ACCENTS) {
					applyAccent(accent, mode === "dark");
					const vars = computeStudioScopedVars({ ...DEFAULT_STUDIO_STATE, accent }, mode);
					expect(vars["--basalt-primary"] ?? baselinePrimary, `${accent} ${mode}`).toBe(
						root.style.getPropertyValue("--basalt-primary"),
					);
					expect(
						vars["--basalt-primary-foreground"] ?? baselineForeground,
						`${accent} ${mode}`,
					).toBe(root.style.getPropertyValue("--basalt-primary-foreground"));
					expect(vars["--basalt-link"] ?? baselineLink, `${accent} ${mode}`).toBe(
						root.style.getPropertyValue("--basalt-link"),
					);
					expect(vars["--basalt-ring"] ?? baselineRing, `${accent} ${mode}`).toBe(
						root.style.getPropertyValue("--basalt-ring"),
					);
					const primary = vars["--basalt-primary"] ?? baselinePrimary;
					const foreground = vars["--basalt-primary-foreground"] ?? baselineForeground;
					const link = vars["--basalt-link"] ?? baselineLink;
					expect(contrast(primary, foreground), `${accent} ${mode} button`).toBeGreaterThanOrEqual(
						4.5,
					);
					for (const surfaceTint of ["warm", "cool"] as const) {
						const tinted = computeStudioScopedVars(
							{ ...DEFAULT_STUDIO_STATE, accent, surfaceTint },
							mode,
						);
						for (const surface of [
							tinted["--basalt-background"],
							tinted["--basalt-card"],
							tinted["--basalt-secondary"],
							tinted["--basalt-bright"],
						]) {
							expect(
								contrast(link, surface),
								`${accent} ${mode} ${surfaceTint}`,
							).toBeGreaterThanOrEqual(4.5);
						}
					}
				}
			}
		} finally {
			if (style === null) root.removeAttribute("style");
			else root.setAttribute("style", style);
			if (previous === undefined) delete root.dataset.accent;
			else root.dataset.accent = previous;
		}
	});
	it("exports only changed tokens, preserving dark overrides and custom swatches", () => {
		expect(computeStudioScopedVars(DEFAULT_STUDIO_STATE, "light")).toEqual({});
		expect(generateThemeCssDiff(DEFAULT_STUDIO_STATE)).toBe(
			"/* Default Basalt tokens — no overrides required. */\n",
		);
		const sharp = generateThemeCssDiff({ ...DEFAULT_STUDIO_STATE, radius: "sharp" });
		expect(sharp).toContain("--basalt-radius-sm: 0.125rem;");
		expect(sharp).not.toContain(".dark");
		expect(sharp).not.toContain("--basalt-background");
		expect(generateThemeCssDiff({ ...DEFAULT_STUDIO_STATE, fontPairing: "sans" })).toContain(
			'--basalt-font-display: "Inter"',
		);
		const options: StudioPresetState = {
			accent: "teal",
			surfaceTint: "cool",
			radius: "soft",
			chartMode: "monochrome",
			fontPairing: "technical",
		};
		const css = generateThemeCssDiff(options);
		expect(css).toContain(":root {");
		expect(css).toContain('.dark,\n[data-mode="dark"] {');
		const darkSelector = css.match(/\.dark,\s*\[data-mode="dark"\]/)?.[0];
		expect(darkSelector).toBeDefined();
		const host = document.createElement("div");
		host.className = "dark";
		expect(host.matches(darkSelector as string)).toBe(true);
		host.className = "";
		host.dataset.mode = "dark";
		expect(host.matches(darkSelector as string)).toBe(true);
		expect(css.match(/--basalt-chart-1: var\(--basalt-primary\);/g)).toHaveLength(2);
		expect(css).toContain('--basalt-font-display: "JetBrains Mono"');
		expect(css).toContain("--basalt-radius-island: 1rem;");
		const changed = ACCENT_SWATCHES.map((swatch) =>
			swatch.id === "primary" ? { ...swatch, light: "345 88% 72%", dark: "345 88% 77%" } : swatch,
		);
		for (const mode of ["light", "dark"] as StudioMode[]) {
			const custom = computeStudioScopedVars(DEFAULT_STUDIO_STATE, mode, changed);
			const rose = computeStudioScopedVars({ ...DEFAULT_STUDIO_STATE, accent: "rose" }, mode);
			expect(custom).toEqual(rose);
		}
		expect(generateThemeCssDiff(DEFAULT_STUDIO_STATE, changed)).toContain("--basalt-primary:");
		const darkSwatch = [{ id: "primary", light: "0 0% 50%", dark: "0 0% 1%" }];
		expect(
			computeStudioScopedVars(DEFAULT_STUDIO_STATE, "dark", darkSwatch)["--basalt-link"],
		).not.toBe("0 0% 1%");
		const brightDarkSwatch = [{ id: "primary", light: "0 0% 50%", dark: "0 0% 95%" }];
		expect(
			computeStudioScopedVars(DEFAULT_STUDIO_STATE, "dark", brightDarkSwatch)["--basalt-primary"],
		).not.toBe("0 0% 95%");
		expect(
			computeStudioScopedVars({ ...DEFAULT_STUDIO_STATE, accent: "sky" }, "light", []),
		).toEqual(computeStudioScopedVars({ ...DEFAULT_STUDIO_STATE, accent: "sky" }, "light"));
	});
});
