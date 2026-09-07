import { act, fireEvent, render, screen } from "@testing-library/react";
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

	it("covers ValuesHeatmap full keyboard suite: ArrowLeft, ArrowUp, ArrowDown, Home, End, Escape, unknown key, and focus/blur", () => {
		const values = Array.from({ length: 20 }, (_, i) => i);
		render(<HeatmapCalendar values={values} ariaLabel="Values nav heat" />);

		const buttons = screen.getAllByRole("button");
		const firstBtn = buttons[0];
		if (!firstBtn) throw new Error("firstBtn missing");

		// Focus opens tooltip with exact visible reading
		act(() => {
			firstBtn.focus();
		});
		expect(document.activeElement).toBe(firstBtn);
		expect(screen.getByRole("tooltip")).toHaveTextContent("Position 1: 0");

		// Escape closes tooltip
		fireEvent.keyDown(firstBtn, { key: "Escape" });
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		expect(firstBtn).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(firstBtn);

		// ArrowDown (+7 items) -> index 7
		fireEvent.keyDown(firstBtn, { key: "ArrowDown" });
		const btn7 = buttons[7];
		if (!btn7) throw new Error("btn7 missing");
		expect(btn7).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn7);
		expect(btn7).toHaveAttribute("aria-label", "Position 8: 7");

		// ArrowDown again -> index 14
		fireEvent.keyDown(btn7, { key: "ArrowDown" });
		const btn14 = buttons[14];
		if (!btn14) throw new Error("btn14 missing");
		expect(btn14).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn14);

		// ArrowDown clamped to max length - 1 (19)
		fireEvent.keyDown(btn14, { key: "ArrowDown" });
		const btn19 = buttons[19];
		if (!btn19) throw new Error("btn19 missing");
		expect(btn19).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn19);

		// ArrowLeft -> index 18
		fireEvent.keyDown(btn19, { key: "ArrowLeft" });
		const btn18 = buttons[18];
		if (!btn18) throw new Error("btn18 missing");
		expect(btn18).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn18);

		// ArrowUp (-7 items) -> index 11
		fireEvent.keyDown(btn18, { key: "ArrowUp" });
		const btn11 = buttons[11];
		if (!btn11) throw new Error("btn11 missing");
		expect(btn11).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn11);

		// ArrowUp again -> index 4
		fireEvent.keyDown(btn11, { key: "ArrowUp" });
		const btn4 = buttons[4];
		if (!btn4) throw new Error("btn4 missing");
		expect(btn4).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn4);

		// ArrowUp clamped to 0
		fireEvent.keyDown(btn4, { key: "ArrowUp" });
		expect(firstBtn).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(firstBtn);

		// ArrowLeft at 0 stays at 0
		fireEvent.keyDown(firstBtn, { key: "ArrowLeft" });
		expect(firstBtn).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(firstBtn);

		// End -> index 19
		fireEvent.keyDown(firstBtn, { key: "End" });
		expect(btn19).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn19);

		// Home -> index 0
		fireEvent.keyDown(btn19, { key: "Home" });
		expect(firstBtn).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(firstBtn);

		// Unknown key does not trigger preventDefault
		const unhandledEvt = new KeyboardEvent("keydown", {
			key: "a",
			bubbles: true,
			cancelable: true,
		});
		firstBtn.dispatchEvent(unhandledEvt);
		expect(unhandledEvt.defaultPrevented).toBe(false);
		expect(firstBtn).toHaveAttribute("tabindex", "0");

		// Blur closes tooltip
		act(() => {
			firstBtn.blur();
		});
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("restores active document.activeElement when values shrink 10->2, empty, and restore", () => {
		const tenValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const { rerender } = render(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={tenValues} ariaLabel="Shrink Heat" />
			</div>,
		);

		const initialButtons = screen.getAllByRole("button");
		// initialButtons[0] is outside, 1..10 are cells
		expect(initialButtons).toHaveLength(11);
		const cellButtons = initialButtons.slice(1);
		expect(cellButtons).toHaveLength(10);

		const cell9 = cellButtons[9]; // index 9
		act(() => {
			cell9?.focus();
		});
		expect(document.activeElement).toBe(cell9);

		// Shrink array from 10 to 2
		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={[100, 200]} ariaLabel="Shrink Heat" />
			</div>,
		);
		const twoButtons = screen.getAllByRole("button").slice(1);
		expect(twoButtons).toHaveLength(2);
		// Focus must be restored to index 1 (the new clamped active element)
		expect(document.activeElement).toBe(twoButtons[1]);
		expect(twoButtons[1]).toHaveAttribute("tabindex", "0");
		expect(twoButtons[1]).toHaveAttribute("aria-label", "Position 2: 200");

		// Empty the array
		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={[]} ariaLabel="Shrink Heat" />
			</div>,
		);
		const emptyRegion = screen.getByRole("region", { name: "Shrink Heat" });
		expect(document.activeElement).toBe(emptyRegion);

		// Reload values [4, 5] -> focus must be restored to first cell ("Position 1: 4")
		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={[4, 5]} ariaLabel="Shrink Heat" />
			</div>,
		);
		const reloadedButtons = screen.getAllByRole("button").slice(1);
		expect(reloadedButtons).toHaveLength(2);
		expect(document.activeElement).toBe(reloadedButtons[0]);
		expect(reloadedButtons[0]).toHaveAttribute("aria-label", "Position 1: 4");

		// When focus is moved outside, emptying and reloading values must NOT steal focus back
		const outsideBtn = screen.getByRole("button", { name: "Outside" });
		act(() => {
			outsideBtn.focus();
		});
		expect(document.activeElement).toBe(outsideBtn);

		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={[]} ariaLabel="Shrink Heat" />
			</div>,
		);
		expect(document.activeElement).toBe(outsideBtn);

		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={[6]} ariaLabel="Shrink Heat" />
			</div>,
		);
		expect(document.activeElement).toBe(outsideBtn);

		// C23 outside focus branch 2: empty region holds focus first, user then focuses Outside, then values reloaded [4,5]
		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={[]} ariaLabel="Shrink Heat" />
			</div>,
		);
		const emptyReg = screen.getByRole("region", { name: "Shrink Heat" });
		act(() => {
			emptyReg.focus();
		});
		expect(document.activeElement).toBe(emptyReg);

		// User now explicitly moves focus outside from the empty region (triggers empty container onBlur)
		act(() => {
			outsideBtn.focus();
		});
		expect(document.activeElement).toBe(outsideBtn);

		// Now values reloaded [4, 5] -> focus must remain on Outside without stealing back
		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={[4, 5]} ariaLabel="Shrink Heat" />
			</div>,
		);
		expect(document.activeElement).toBe(outsideBtn);

		// Path 1: 10 values, last cell focused, user moves focus outside, shrinks non-empty to 2 values:
		// outside focus is preserved, active index is adjusted to index 1 (item 2), and tab stop/tooltip reading correct
		const tenNumbers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={tenNumbers} ariaLabel="Shrink Heat" />
			</div>,
		);

		const cellsTen = screen.getAllByRole("button").slice(1); // skip outside button
		expect(cellsTen).toHaveLength(10);
		// Focus last cell (index 9)
		act(() => {
			cellsTen[9]?.focus();
		});
		expect(document.activeElement).toBe(cellsTen[9]);
		expect(cellsTen[9]).toHaveAttribute("tabindex", "0");

		// User moves focus to outside button
		act(() => {
			outsideBtn.focus();
		});
		expect(document.activeElement).toBe(outsideBtn);

		// Non-empty shrink to 2 values [10, 20]
		rerender(
			<div>
				<button id="outside" type="button">
					Outside
				</button>
				<HeatmapCalendar values={[10, 20]} ariaLabel="Shrink Heat" />
			</div>,
		);

		// Focus must remain on outside button (not stolen)
		expect(document.activeElement).toBe(outsideBtn);

		// Active tabstop is clamped to 2nd cell (index 1)
		const cellsTwo = screen.getAllByRole("button").slice(1);
		expect(cellsTwo).toHaveLength(2);
		expect(cellsTwo[0]).toHaveAttribute("tabindex", "-1");
		expect(cellsTwo[1]).toHaveAttribute("tabindex", "0");
		expect(cellsTwo[1]).toHaveAttribute("aria-label", "Position 2: 20");

		// When user focuses back on the clamped active tabstop, reading is accurate
		act(() => {
			cellsTwo[1]?.focus();
		});
		expect(document.activeElement).toBe(cellsTwo[1]);
		expect(screen.getByRole("tooltip").textContent).toBe("Position 2: 20");
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

	it("preserves open tooltip and cell focus during scroll on values heatmap", () => {
		render(<HeatmapCalendar values={[4, 5]} ariaLabel="Scroll dismiss test" />);
		const region = screen.getByRole("region", { name: "Scroll dismiss test" });
		const buttons = screen.getAllByRole("button");
		const firstCell = buttons[0];
		if (!firstCell) throw new Error("firstCell missing");

		act(() => {
			firstCell.focus();
		});
		expect(document.activeElement).toBe(firstCell);
		expect(screen.getByRole("tooltip")).toHaveTextContent("Position 1: 4");

		// Fire scroll on region -> tooltip remains open with exact reading and cell retains focus
		fireEvent.scroll(region);
		expect(screen.getByRole("tooltip")).toHaveTextContent("Position 1: 4");
		expect(document.activeElement).toBe(firstCell);
	});

	it("covers YearHeatmap keyboard branches: ArrowUp, ArrowLeft, Home, End, clamps, custom labels, and blur", () => {
		const data = [
			{ date: "2026-01-01", value: 0 },
			{ date: "2026-01-02", value: 10 },
			{ date: "2026-12-31", value: 50 },
		];
		const customWeekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
		const customMonths = [
			"M01",
			"M02",
			"M03",
			"M04",
			"M05",
			"M06",
			"M07",
			"M08",
			"M09",
			"M10",
			"M11",
			"M12",
		];

		const { rerender } = render(
			<div>
				<button id="outside-year-heat" type="button">
					Outside Year Heat
				</button>
				<HeatmapCalendar
					data={data}
					year={2026}
					weekdayLabels={customWeekdays}
					monthLabels={customMonths}
					colorScale={heatmapColorScales.red}
					valueFormatter={(v) => `${v} custom_pts`}
					metricLabel="ActivityScore"
					ariaLabel="Custom Year Heat"
				/>
			</div>,
		);

		// Assert distinctly different custom month and weekday labels
		expect(screen.getByText("Mo")).toBeInTheDocument();
		expect(screen.getByText("We")).toBeInTheDocument();
		expect(screen.getByText("M01")).toBeInTheDocument();

		const jan1 = screen.getByRole("button", { name: /2026-01-01, ActivityScore: 0 custom_pts/ });
		act(() => {
			jan1.focus();
		});
		expect(document.activeElement).toBe(jan1);

		// Tooltip content check with custom formatter
		expect(screen.getByText("ActivityScore: 0 custom_pts")).toBeInTheDocument();

		// ArrowUp on first item clamps to index 0
		fireEvent.keyDown(jan1, { key: "ArrowUp" });
		expect(jan1).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(jan1);

		// ArrowLeft on first item clamps to index 0
		fireEvent.keyDown(jan1, { key: "ArrowLeft" });
		expect(jan1).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(jan1);

		// End jumps to last day of year (2026-12-31)
		fireEvent.keyDown(jan1, { key: "End" });
		const dec31 = screen.getByRole("button", { name: /2026-12-31/ });
		expect(dec31).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(dec31);

		// ArrowDown on last item clamps to last item
		fireEvent.keyDown(dec31, { key: "ArrowDown" });
		expect(dec31).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(dec31);

		// ArrowRight on last item clamps to last item
		fireEvent.keyDown(dec31, { key: "ArrowRight" });
		expect(dec31).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(dec31);

		// ArrowUp from dec31 moves to previous day (2026-12-30)
		fireEvent.keyDown(dec31, { key: "ArrowUp" });
		const dec30 = screen.getByRole("button", { name: /2026-12-30/ });
		expect(dec30).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(dec30);

		// ArrowLeft from dec30 moves -7 days (2026-12-23)
		fireEvent.keyDown(dec30, { key: "ArrowLeft" });
		const dec23 = screen.getByRole("button", { name: /2026-12-23/ });
		expect(dec23).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(dec23);

		// Home jumps back to 2026-01-01
		fireEvent.keyDown(dec23, { key: "Home" });
		expect(jan1).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(jan1);

		// Unknown key does not trigger preventDefault
		const unhandledEvt = new KeyboardEvent("keydown", {
			key: "x",
			bubbles: true,
			cancelable: true,
		});
		jan1.dispatchEvent(unhandledEvt);
		expect(unhandledEvt.defaultPrevented).toBe(false);

		// Switch focus to outside button and verify year change does not steal focus
		const outsideBtn = screen.getByRole("button", { name: "Outside Year Heat" });
		act(() => {
			outsideBtn.focus();
		});
		expect(document.activeElement).toBe(outsideBtn);

		rerender(
			<div>
				<button id="outside-year-heat" type="button">
					Outside Year Heat
				</button>
				<HeatmapCalendar
					data={data}
					year={2027}
					weekdayLabels={customWeekdays}
					monthLabels={customMonths}
					colorScale={heatmapColorScales.red}
					valueFormatter={(v) => `${v} custom_pts`}
					metricLabel="ActivityScore"
					ariaLabel="Custom Year Heat"
				/>
			</div>,
		);
		expect(document.activeElement).toBe(outsideBtn);
	});

	it("renders year ending Saturday dates and bounds, and returns to Dec 31 on End", () => {
		// 2022-12-31 is Saturday, ending exactly on the last day of the week
		const data2022 = [
			{ date: "2022-01-01", value: 10 },
			{ date: "2022-12-31", value: 99 },
		];
		render(<HeatmapCalendar data={data2022} year={2022} ariaLabel="Year 2022 Heat" />);

		const buttons = screen.getAllByRole("button");
		// Exactly 365 days in 2022
		expect(buttons).toHaveLength(365);

		const jan1 = screen.getByRole("button", { name: /2022-01-01/ });
		const dec31 = screen.getByRole("button", { name: /2022-12-31/ });
		expect(jan1).toBeInTheDocument();
		expect(dec31).toBeInTheDocument();

		// Week columns check before focus: jan1's week column parent container has exactly 53 week columns,
		// and dec31 is located within the 53rd (last) week column.
		const jan1WeekCol = jan1.closest(".flex.flex-col");
		const weeksContainer = jan1WeekCol?.parentElement;
		expect(weeksContainer).toBeDefined();
		const weekElements = Array.from(weeksContainer?.children ?? []);
		expect(weekElements).toHaveLength(53);
		expect(weekElements[52]?.contains(dec31)).toBe(true);

		act(() => {
			dec31.focus();
		});
		expect(document.activeElement).toBe(dec31);

		// ArrowRight and ArrowDown on year boundary Saturday stay clamped without error
		fireEvent.keyDown(dec31, { key: "ArrowRight" });
		expect(document.activeElement).toBe(dec31);
		fireEvent.keyDown(dec31, { key: "ArrowDown" });
		expect(document.activeElement).toBe(dec31);

		// Home jumps to Jan 1
		fireEvent.keyDown(dec31, { key: "Home" });
		expect(document.activeElement).toBe(jan1);
		expect(jan1).toHaveAttribute("tabindex", "0");

		// End returns to Dec 31
		fireEvent.keyDown(jan1, { key: "End" });
		expect(document.activeElement).toBe(dec31);
		expect(dec31).toHaveAttribute("tabindex", "0");
	});
});
