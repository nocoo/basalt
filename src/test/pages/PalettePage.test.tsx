import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SitePaletteProvider } from "@/components/SitePaletteProvider";
import PalettePage from "@/pages/PalettePage";

describe("PalettePage", () => {
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
});
