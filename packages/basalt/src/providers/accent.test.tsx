import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ACCENT_SWATCHES, AccentProvider, applyAccent, useAccent } from "./accent";

function Probe() {
	const { accent, setAccent, swatches } = useAccent();
	return (
		<div>
			<span data-testid="accent">{accent}</span>
			<button type="button" onClick={() => setAccent(swatches[2].id)}>
				pick
			</button>
		</div>
	);
}

describe("accent", () => {
	it("applies primary and ring from the theme palette swatch", () => {
		applyAccent("teal", false);
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("186 80% 45%");
		expect(document.documentElement.style.getPropertyValue("--basalt-ring")).toBe("186 80% 45%");
		expect(document.documentElement.style.getPropertyValue("--basalt-chart-1")).toBe("");
		expect(document.documentElement.style.getPropertyValue("--basalt-primary-foreground")).toBe(
			"0 0% 10%",
		);
		expect(document.documentElement.dataset.accent).toBe("teal");
	});

	it("pairs light amber with dark foreground for contrast", () => {
		applyAccent("amber", false);
		expect(document.documentElement.style.getPropertyValue("--basalt-primary-foreground")).toBe(
			"0 0% 10%",
		);
	});

	it("uses the dark stop when the page is dark", () => {
		applyAccent("green", true);
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("142 71% 50%");
	});

	it("exposes every visualization color as a theme swatch", () => {
		expect(ACCENT_SWATCHES).toHaveLength(24);
		expect(ACCENT_SWATCHES.map((swatch) => swatch.token)).toEqual(
			Array.from({ length: 24 }, (_, index) => `--basalt-chart-${index + 1}`),
		);
	});

	it("persists the chosen swatch", () => {
		window.localStorage.removeItem("basalt-accent");
		render(
			<AccentProvider>
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");
		act(() => {
			screen.getByRole("button", { name: "pick" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent(ACCENT_SWATCHES[2].id);
		expect(window.localStorage.getItem("basalt-accent")).toBe(ACCENT_SWATCHES[2].id);
	});
});
