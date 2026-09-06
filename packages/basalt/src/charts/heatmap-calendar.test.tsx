import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeatmapCalendar, heatmapColorScales } from "./heatmap-calendar";

describe("HeatmapCalendar", () => {
	it("renders a compact values grid with single tab stop and arrow navigation", () => {
		const { rerender } = render(<HeatmapCalendar values={[10, 20, 30]} ariaLabel="Heat" />);
		const region = screen.getByRole("region", { name: "Heat" });
		expect(region).toBeInTheDocument();

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(3);
		expect(buttons[0]).toHaveAttribute("tabindex", "0");
		expect(buttons[1]).toHaveAttribute("tabindex", "-1");
		expect(buttons[0]).toHaveAttribute("aria-label", "Position 1: 10");

		// Arrow navigation on the button
		fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
		expect(buttons[1]).toHaveAttribute("tabindex", "0");
		expect(buttons[0]).toHaveAttribute("tabindex", "-1");

		// Empty values safe fallback
		rerender(<HeatmapCalendar values={[]} ariaLabel="Empty Heat" />);
		expect(screen.getByRole("region", { name: "Empty Heat" })).toBeInTheDocument();
	});

	it("restores active document.activeElement when values shrink 10->2 and then empty", () => {
		const tenValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const { rerender } = render(<HeatmapCalendar values={tenValues} ariaLabel="Shrink Heat" />);

		const initialButtons = screen.getAllByRole("button");
		expect(initialButtons).toHaveLength(10);

		// Focus the last item (index 9)
		initialButtons[9]?.focus();
		expect(document.activeElement).toBe(initialButtons[9]);

		// Shrink array from 10 to 2
		rerender(<HeatmapCalendar values={[100, 200]} ariaLabel="Shrink Heat" />);
		const twoButtons = screen.getAllByRole("button");
		expect(twoButtons).toHaveLength(2);
		// Focus must be restored to index 1 (the new clamped active element)
		expect(document.activeElement).toBe(twoButtons[1]);
		expect(twoButtons[1]).toHaveAttribute("tabindex", "0");

		// Empty the array
		rerender(<HeatmapCalendar values={[]} ariaLabel="Shrink Heat" />);
		const emptyRegion = screen.getByRole("region", { name: "Shrink Heat" });
		expect(document.activeElement).toBe(emptyRegion);
	});

	it("restores active document.activeElement when year changes while focused on a date", () => {
		const year2026Data = [
			{ date: "2026-01-01", value: 1 },
			{ date: "2026-12-31", value: 99 },
		];
		const { rerender } = render(
			<HeatmapCalendar data={year2026Data} year={2026} ariaLabel="Year change heat" />,
		);

		const dec31Button = screen.getByRole("button", { name: /2026-12-31/ });
		dec31Button.focus();
		expect(document.activeElement).toBe(dec31Button);

		// Switch year to 2027
		const year2027Data = [
			{ date: "2027-01-01", value: 5 },
			{ date: "2027-06-15", value: 20 },
		];
		rerender(<HeatmapCalendar data={year2027Data} year={2027} ariaLabel="Year change heat" />);

		const jan1Button2027 = screen.getByRole("button", { name: /2027-01-01/ });
		expect(document.activeElement).toBe(jan1Button2027);
		expect(jan1Button2027).toHaveAttribute("tabindex", "0");
	});

	it("renders a year calendar grid with accessible scroll region, single tab stop, and keyboard traversal", () => {
		const data = [
			{ date: "2026-01-01", value: 4 },
			{ date: "2026-01-02", value: 8 },
			{ date: "2026-01-08", value: 12 },
		];
		render(
			<HeatmapCalendar
				data={data}
				year={2026}
				colorScale={heatmapColorScales.blue}
				metricLabel="Sessions"
				ariaLabel="Year heat"
			/>,
		);

		const scrollRegion = screen.getByRole("region", { name: "Year heat scrollable view" });
		expect(scrollRegion).toBeInTheDocument();
		expect(scrollRegion).toHaveAttribute("tabindex", "-1");

		const group = screen.getByRole("group", { name: "Year heat" });
		expect(group).toBeInTheDocument();

		// First day cell
		const jan1 = screen.getByRole("button", { name: /2026-01-01, Sessions: 4/ });
		expect(jan1).toBeInTheDocument();
		expect(jan1).toHaveAttribute("tabindex", "0");

		// ArrowDown navigates visually down in the column (next day: Jan 2)
		fireEvent.keyDown(jan1, { key: "ArrowDown" });
		const jan2 = screen.getByRole("button", { name: /2026-01-02, Sessions: 8/ });
		expect(jan2).toHaveAttribute("tabindex", "0");
		expect(jan1).toHaveAttribute("tabindex", "-1");

		// ArrowRight navigates visually right (+7 days by index: Jan 9)
		fireEvent.keyDown(jan2, { key: "ArrowRight" });
		const jan9 = screen.getByRole("button", { name: /2026-01-09/ });
		expect(jan9).toHaveAttribute("tabindex", "0");
		expect(jan2).toHaveAttribute("tabindex", "-1");
		expect(document.activeElement).toBe(jan9);

		// Escape closes tooltip without breaking focus
		fireEvent.keyDown(jan9, { key: "Escape" });
		expect(jan9).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(jan9);
	});
});
