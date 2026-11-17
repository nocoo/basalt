import { AccentProvider, useAccent } from "@nocoo/basalt/providers/accent";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	DEFAULT_STUDIO_STATE,
	encodeStudioPreset,
	STUDIO_PRESETS,
	type StudioPresetId,
} from "@/models/theme-studio";
import { useThemeStudioViewModel } from "@/viewmodels/useThemeStudioViewModel";

function wrapper({ children }: { children: ReactNode }) {
	return createElement(AccentProvider, { persist: false, children });
}
function useStudioTest() {
	return { studio: useThemeStudioViewModel(), accent: useAccent() };
}
afterEach(() => {
	vi.restoreAllMocks();
	window.history.replaceState(null, "", "/");
	document.documentElement.classList.remove("dark");
	document.documentElement.removeAttribute("data-mode");
	localStorage.removeItem("basalt-accent");
});

describe("useThemeStudioViewModel", () => {
	it("updates presets, shared accent, URL, options and preview mode", async () => {
		window.history.replaceState({ marker: 1 }, "", "/palette?other=kept#details");
		const { result } = renderHook(useStudioTest, { wrapper });
		expect(result.current.studio.options).toEqual(DEFAULT_STUDIO_STATE);
		expect(result.current.studio.mode).toBe("light");
		expect(result.current.studio.stageTab).toBe("preview");
		expect(result.current.studio.presetId).toBe("default");
		act(() => result.current.studio.applyPreset("ops"));
		await waitFor(() => expect(result.current.accent.accent).toBe("teal"));
		expect(result.current.studio.presetId).toBe("ops");
		expect(result.current.studio.scopedVars["--basalt-background"]).toBe("215 12% 95.7%");
		expect(window.location.search).toContain(
			`preset=${encodeStudioPreset(result.current.studio.options)}`,
		);
		expect(window.location.search).toContain("other=kept");
		expect(window.location.hash).toBe("#details");
		expect(window.history.state).toEqual({ marker: 1 });
		act(() => {
			result.current.studio.updateOption("radius", "soft");
			result.current.studio.setStageTab("code");
		});
		expect(result.current.studio.presetId).toBe("custom");
		expect(result.current.studio.stageTab).toBe("code");
		expect(result.current.studio.cssDiff).toContain("--basalt-radius-lg: 1rem;");
		act(() => document.documentElement.classList.add("dark"));
		await waitFor(() => expect(result.current.studio.mode).toBe("dark"));
		expect(result.current.studio.scopedVars["--basalt-background"]).toBe("215 8% 9%");
		act(() => document.documentElement.setAttribute("data-mode", "dark"));
		act(() => document.documentElement.classList.remove("dark"));
		await waitFor(() => expect(result.current.studio.mode).toBe("light"));
		act(() => result.current.accent.setAccent("rose"));
		await waitFor(() => expect(result.current.studio.options.accent).toBe("rose"));
		act(() => result.current.studio.applyPreset("not-a-preset" as StudioPresetId));
		expect(result.current.studio.options.accent).toBe("rose");
		act(() => result.current.studio.reset());
		await waitFor(() => expect(result.current.accent.accent).toBe("primary"));
		expect(result.current.studio.options).toEqual(DEFAULT_STUDIO_STATE);
		expect(window.location.search).toBe("?other=kept");
		expect(result.current.studio.shareUrl).toContain("/palette?other=kept&preset=00000#details");
	});
	it("loads a shared preset, handles invalid links and keeps existing accent without a preset", async () => {
		const selected = STUDIO_PRESETS.find((preset) => preset.id === "limestone");
		if (!selected) throw new Error("Missing preset");
		window.history.replaceState(
			null,
			"",
			`/palette?x=1&preset=${encodeStudioPreset(selected.options)}`,
		);
		const shared = renderHook(useStudioTest, { wrapper });
		await waitFor(() => expect(shared.result.current.accent.accent).toBe("amber"));
		expect(shared.result.current.studio.options).toEqual(selected.options);
		shared.unmount();
		window.history.replaceState(null, "", "/palette?preset=broken&x=1");
		const invalid = renderHook(useStudioTest, { wrapper });
		await waitFor(() => expect(window.location.search).toBe("?x=1"));
		expect(invalid.result.current.studio.options).toEqual(DEFAULT_STUDIO_STATE);
		invalid.unmount();
		window.history.replaceState(null, "", "/palette");
		const withAccent = ({ children }: { children: ReactNode }) =>
			createElement(AccentProvider, { persist: false, defaultAccent: "rose", children });
		const initial = renderHook(useStudioTest, { wrapper: withAccent });
		expect(initial.result.current.studio.options.accent).toBe("rose");
		await waitFor(() => expect(window.location.search).toContain("preset="));
	});
	it("keeps an ordinary default visit clean and honors a later accent preference", async () => {
		window.history.replaceState({ marker: 1 }, "", "/palette?other=kept#details");
		const replace = vi.spyOn(window.history, "replaceState");
		const first = renderHook(useStudioTest, { wrapper: AccentProvider });
		expect(replace).not.toHaveBeenCalled();
		expect(window.location.search).toBe("?other=kept");
		const originalUrl = window.location.href;
		const copy = vi.fn().mockResolvedValue(undefined);
		await act(() => first.result.current.studio.copyShareLink(copy));
		expect(new URL(copy.mock.calls[0][0]).searchParams.get("preset")).toBe("00000");
		first.unmount();
		window.history.pushState(null, "", "/dashboard");
		const preferences = renderHook(useAccent, { wrapper: AccentProvider });
		act(() => preferences.result.current.setAccent("rose"));
		expect(localStorage.getItem("basalt-accent")).toBe("rose");
		preferences.unmount();
		act(() => window.history.back());
		await waitFor(() => expect(window.location.href).toBe(originalUrl));
		const returned = renderHook(useStudioTest, { wrapper: AccentProvider });
		await waitFor(() => expect(returned.result.current.studio.options.accent).toBe("rose"));
		expect(returned.result.current.accent.accent).toBe("rose");
		expect(window.location.hash).toBe("#details");
		expect(window.location.search).toContain("other=kept");
	});
	it("shares the default explicitly across different stored accents", async () => {
		window.history.replaceState(null, "", "/palette");
		const sender = renderHook(useStudioTest, { wrapper });
		const write = vi.fn().mockResolvedValue(undefined);
		await act(() => sender.result.current.studio.copyShareLink(write));
		const share = write.mock.calls[0][0] as string;
		expect(new URL(share).searchParams.get("preset")).toBe(
			encodeStudioPreset(DEFAULT_STUDIO_STATE),
		);
		sender.unmount();
		localStorage.setItem("basalt-accent", "rose");
		window.history.replaceState(null, "", share);
		const recipient = renderHook(useStudioTest, { wrapper: AccentProvider });
		await waitFor(() => expect(recipient.result.current.accent.accent).toBe("primary"));
		expect(recipient.result.current.studio.options.accent).toBe("primary");
	});
	it("copies CSS and share links, including clipboard errors and default clipboard", async () => {
		const { result } = renderHook(useStudioTest, { wrapper });
		act(() => result.current.studio.applyPreset("graphite"));
		const write = vi.fn().mockResolvedValue(undefined);
		await act(() => result.current.studio.copyCssDiff(write));
		expect(write).toHaveBeenLastCalledWith(result.current.studio.cssDiff);
		expect(result.current.studio.copyStatus).toBe("css");
		await act(() => result.current.studio.copyShareLink(write));
		expect(write).toHaveBeenLastCalledWith(result.current.studio.shareUrl);
		expect(result.current.studio.copyStatus).toBe("link");
		await act(() =>
			result.current.studio.copyCssDiff(vi.fn().mockRejectedValue(new Error("denied"))),
		);
		expect(result.current.studio.copyStatus).toBe("error");
		act(() => result.current.studio.updateOption("fontPairing", "sans"));
		expect(result.current.studio.copyStatus).toBe("idle");
		const clipboard = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: clipboard },
		});
		await act(() => result.current.studio.copyShareLink());
		expect(clipboard).toHaveBeenCalledWith(result.current.studio.shareUrl);
		act(() => result.current.accent.setAccent("sky"));
		await waitFor(() => expect(result.current.studio.options.accent).toBe("sky"));
		expect(result.current.studio.copyStatus).toBe("idle");
		act(() => result.current.studio.applyPreset("default"));
		expect(result.current.studio.copyStatus).toBe("idle");
	});
	it("reflects active custom palette colors in preview and export", async () => {
		window.history.replaceState(null, "", "/palette");
		const custom = ({ children }: { children: ReactNode }) =>
			createElement(AccentProvider, {
				persist: false,
				paletteOverrides: { primary: { light: "345 88% 72%", dark: "345 88% 77%" } },
				children,
			});
		const { result, unmount } = renderHook(useStudioTest, { wrapper: custom });
		await waitFor(() =>
			expect(result.current.studio.scopedVars["--basalt-primary"]).toBe(
				document.documentElement.style.getPropertyValue("--basalt-primary"),
			),
		);
		expect(result.current.studio.cssDiff).toContain("--basalt-primary:");
		act(() => document.documentElement.classList.add("dark"));
		await waitFor(() => expect(result.current.studio.mode).toBe("dark"));
		await waitFor(() =>
			expect(result.current.studio.scopedVars["--basalt-primary"]).toBe(
				document.documentElement.style.getPropertyValue("--basalt-primary"),
			),
		);
		unmount();
	});
	it("retains usable state if history writes are denied", () => {
		window.history.replaceState(null, "", "/palette");
		const { result, unmount } = renderHook(useStudioTest, { wrapper });
		vi.spyOn(window.history, "replaceState").mockImplementation(() => {
			throw new Error("denied");
		});
		act(() => result.current.studio.updateOption("surfaceTint", "warm"));
		expect(result.current.studio.shareUrl).toContain("preset=");
		expect(result.current.studio.scopedVars["--basalt-background"]).toBe("40 14% 95.7%");
		unmount();
	});
	it("renders without browser globals", () => {
		const windowValue = globalThis.window;
		const documentValue = globalThis.document;
		try {
			vi.stubGlobal("window", undefined);
			vi.stubGlobal("document", undefined);
			function Probe() {
				const studio = useThemeStudioViewModel();
				return createElement("span", null, `${studio.mode}:${studio.shareUrl}`);
			}
			const children = createElement(Probe);
			expect(
				renderToString(
					createElement(AccentProvider, {
						persist: false,
						applyToDocument: false,
						children,
					}),
				),
			).toContain("light:");
		} finally {
			vi.stubGlobal("window", windowValue);
			vi.stubGlobal("document", documentValue);
		}
	});
});
