import { fireEvent, render, screen } from "@testing-library/react";
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
		fireEvent.click(screen.getByRole("button", { name: "Pink" }));
		expect(window.localStorage.getItem("basalt-accent")).toBe("rose");
		expect(document.documentElement.dataset.accent).toBe("rose");
	});
});
