import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SitePaletteProvider } from "@/components/SitePaletteProvider";
import PalettePage from "@/pages/PalettePage";

describe("PalettePage", () => {
	afterEach(() => {
		window.history.replaceState(null, "", "/");
		window.localStorage.removeItem("basalt-accent");
		if (document.documentElement.classList.contains("dark")) {
			act(() => document.documentElement.classList.remove("dark"));
		}
		vi.restoreAllMocks();
	});
	it("applies a theme color from the shared palette", () => {
		window.localStorage.removeItem("basalt-accent");
		render(
			<SitePaletteProvider>
				<PalettePage />
			</SitePaletteProvider>,
		);
		expect(screen.getByRole("heading", { name: "Color palette" })).toBeInTheDocument();
		const swatches = screen.getByRole("group", { name: "Control accents · 12 colors" });
		expect(within(swatches).getAllByRole("button")).toHaveLength(12);
		const island = swatches.closest("[data-basalt-surface]");
		expect(island).not.toBeNull();
		expect(island?.parentElement?.closest("[data-basalt-surface]")).toBeNull();
		expect(island?.querySelector("p")).toHaveTextContent(/Inspired by the translucent iMac/);
		fireEvent.click(screen.getByRole("button", { name: "Pink" }));
		expect(window.localStorage.getItem("basalt-accent")).toBe("rose");
		expect(document.documentElement.dataset.accent).toBe("rose");
	});

	it("applies presets and dials, previews scoped tokens and resets the CSS diff", async () => {
		window.history.replaceState(null, "", "/palette?other=kept#preview");
		window.localStorage.removeItem("basalt-accent");
		const { container } = render(
			<div data-basalt-surface-root="">
				<SitePaletteProvider>
					<PalettePage />
				</SitePaletteProvider>
			</div>,
		);
		expect(container.querySelectorAll("[data-accent-choice]")).toHaveLength(12);
		expect(container.querySelectorAll("[data-accent-swatch]")).toHaveLength(12);
		expect(container.querySelector("[data-palette-preview]")).toBeInTheDocument();
		expect(container.querySelector("[data-chart-palette]")).toBeInTheDocument();
		expect(container.querySelectorAll("[data-chart-swatch]")).toHaveLength(5);
		expect(container.querySelector("[data-palette-rings]")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Theme Studio" })).toBeInTheDocument();
		const stage = container.querySelector<HTMLElement>("[data-theme-studio-stage]");
		expect(stage?.parentElement?.closest("[data-basalt-surface]")).toBeNull();
		expect(stage?.closest("[data-basalt-surface-root]")).toBeInTheDocument();
		expect(stage?.style.getPropertyValue("--basalt-background")).toBe("");
		fireEvent.click(screen.getByRole("button", { name: "Signal Ops" }));
		await waitFor(() => expect(window.localStorage.getItem("basalt-accent")).toBe("teal"));
		expect(stage?.style.getPropertyValue("--basalt-background")).toBe("215 12% 95%");
		expect(stage?.style.getPropertyValue("--basalt-radius-sm")).toBe("0.125rem");
		expect(stage?.style.getPropertyValue("--basalt-chart-1")).toBe("var(--basalt-primary)");
		expect(
			within(stage as HTMLElement).getByRole("img", { name: "Chart colors preview" }).children,
		).toHaveLength(5);
		act(() => document.documentElement.classList.add("dark"));
		await waitFor(() =>
			expect(stage?.style.getPropertyValue("--basalt-background")).toBe("215 8% 7.5%"),
		);
		act(() => document.documentElement.classList.remove("dark"));
		await waitFor(() =>
			expect(stage?.style.getPropertyValue("--basalt-background")).toBe("215 12% 95%"),
		);
		expect(window.location.search).toContain("other=kept");
		expect(window.location.search).toContain("preset=");
		const radius = screen.getByRole("combobox", { name: "Radius Scale" });
		fireEvent.keyDown(radius, { key: "ArrowDown" });
		fireEvent.click(screen.getByRole("option", { name: "Soft" }));
		expect(stage?.style.getPropertyValue("--basalt-radius-lg")).toBe("1rem");
		expect(
			screen.getByText("Custom", { selector: "[data-slot=card-header] span" }),
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole("radio", { name: "02 Token Diff CSS" }));
		const code = container.querySelector("[data-basalt-code]");
		expect(code).toHaveTextContent("--basalt-radius-lg: 1rem;");
		expect(code).toHaveTextContent('[data-mode="dark"] {');
		fireEvent.click(screen.getByRole("button", { name: "Reset studio" }));
		await waitFor(() => expect(window.localStorage.getItem("basalt-accent")).toBe("primary"));
		expect(window.location.search).toBe("?other=kept");
		expect(window.location.hash).toBe("#preview");
		expect(code).toHaveTextContent("Default Basalt tokens — no overrides required.");
	});

	it("copies the live CSS diff and share URL with user feedback", async () => {
		window.history.replaceState(null, "", "/palette");
		window.localStorage.removeItem("basalt-accent");
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
		render(
			<SitePaletteProvider>
				<PalettePage />
			</SitePaletteProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Warm Limestone" }));
		fireEvent.click(screen.getByRole("button", { name: "Copy CSS" }));
		await waitFor(() => expect(writeText).toHaveBeenCalled());
		expect(writeText.mock.calls[0][0]).toContain("--basalt-background:");
		expect(await screen.findByText("CSS copied.")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
		await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
		expect(writeText.mock.calls[1][0]).toContain("preset=");
		expect(await screen.findByText("Link copied.")).toBeInTheDocument();
	});
});
