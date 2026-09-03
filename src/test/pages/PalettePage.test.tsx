import { AccentProvider } from "@nocoo/basalt/providers/accent";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PalettePage from "@/pages/PalettePage";

describe("PalettePage", () => {
	it("applies a theme color from the shared palette", () => {
		window.localStorage.removeItem("basalt-accent");
		render(
			<AccentProvider>
				<PalettePage />
			</AccentProvider>,
		);
		expect(screen.getByRole("heading", { name: "Color palette" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Rose" }));
		expect(window.localStorage.getItem("basalt-accent")).toBe("rose");
		expect(document.documentElement.dataset.accent).toBe("rose");
	});
});
