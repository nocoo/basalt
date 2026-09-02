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
	it("applies primary, ring, and chart-1 from the swatch", () => {
		applyAccent("teal", false);
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("186 72% 28%");
		expect(document.documentElement.style.getPropertyValue("--basalt-ring")).toBe("186 72% 28%");
		expect(document.documentElement.style.getPropertyValue("--basalt-chart-1")).toBe("186 72% 28%");
		expect(document.documentElement.style.getPropertyValue("--basalt-primary-foreground")).toBe(
			"0 0% 100%",
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
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("142 64% 32%");
	});

	it("keeps white-on-accent lightness at or below 38% in dark mode", () => {
		for (const swatch of ACCENT_SWATCHES) {
			if (swatch.foreground !== "0 0% 100%") {
				continue;
			}
			const lightness = Number(swatch.dark.trim().split(/\s+/)[2]?.replace("%", ""));
			expect(lightness, swatch.id).toBeLessThanOrEqual(38);
		}
	});

	it("persists the chosen swatch", () => {
		window.localStorage.removeItem("basalt-accent");
		render(
			<AccentProvider>
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("blue");
		act(() => {
			screen.getByRole("button", { name: "pick" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent(ACCENT_SWATCHES[2].id);
		expect(window.localStorage.getItem("basalt-accent")).toBe(ACCENT_SWATCHES[2].id);
	});
});
