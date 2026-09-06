import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { heatmapColorScales } from "./heatmap-calendar";
import { HeatmapMatrix } from "./heatmap-matrix";
import { ChartTooltipDivider, ChartTooltipRow, ChartTooltipSummary } from "./tooltip";

describe("HeatmapMatrix", () => {
	const sampleRows = ["Mon", "Tue", "Wed"] as const;
	const sampleCols = ["00:00", "06:00", "12:00", "18:00"] as const;
	const sampleValues = [
		[0, 10, 20, 30],
		[5, null, 15, undefined],
		[25, 35, 0, 45],
	] as const;

	it("renders rows and columns with grid semantics and single roving tab stop", () => {
		render(
			<HeatmapMatrix
				rowLabels={sampleRows}
				columnLabels={sampleCols}
				values={sampleValues}
				metricLabel="Throughput"
				ariaLabel="Weekly service throughput"
			/>,
		);

		const gridRegion = screen.getByRole("region", { name: "Weekly service throughput" });
		expect(gridRegion).toBeInTheDocument();

		const grid = screen.getByRole("grid", { name: "Weekly service throughput" });
		expect(grid).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		// 1 header row + 3 data rows = 4 rows
		expect(rows).toHaveLength(4);

		const colHeaders = screen.getAllByRole("columnheader");
		// 1 top-left corner + 4 column headers = 5
		expect(colHeaders).toHaveLength(5);

		const rowHeaders = screen.getAllByRole("rowheader");
		expect(rowHeaders).toHaveLength(3);

		const gridcells = screen.getAllByRole("gridcell");
		expect(gridcells).toHaveLength(12);

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(12);

		// First cell has tabIndex=0, others -1
		expect(buttons[0]).toHaveAttribute("tabindex", "0");
		expect(buttons[1]).toHaveAttribute("tabindex", "-1");

		// Label must clearly distinguish numeric 0 from missing data
		expect(buttons[0]).toHaveAttribute("aria-label", "Mon, 00:00: 0 (Throughput)");

		// ArrowRight steps to col 1
		fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
		expect(buttons[1]).toHaveAttribute("tabindex", "0");
		expect(buttons[0]).toHaveAttribute("tabindex", "-1");

		// ArrowDown steps to row 1, col 1 (which is null)
		fireEvent.keyDown(buttons[1], { key: "ArrowDown" });
		const nullCell = buttons[5]; // row 1, col 1
		expect(nullCell).toHaveAttribute("tabindex", "0");
		expect(nullCell).toHaveAttribute("aria-label", "Tue, 06:00: — (Throughput)");
	});

	it("supports custom columnWidth for rectangular cell geometry while preserving default cellSize", () => {
		const { rerender } = render(
			<HeatmapMatrix
				rowLabels={["Row 1"]}
				columnLabels={["00:00"]}
				values={[[10]]}
				cellSize={20}
				columnWidth={60}
			/>,
		);

		const th = screen.getAllByRole("columnheader")[1];
		expect(th).toHaveStyle({ width: "60px", maxWidth: "60px" });
		const btn = screen.getByRole("button");
		expect(btn).toHaveStyle({ width: "60px", height: "20px" });

		// Default falls back to square cellSize
		rerender(
			<HeatmapMatrix
				rowLabels={["Row 1"]}
				columnLabels={["00:00"]}
				values={[[10]]}
				cellSize={25}
			/>,
		);
		const defaultTh = screen.getAllByRole("columnheader")[1];
		expect(defaultTh).toHaveStyle({ width: "25px", maxWidth: "25px" });
		const defaultBtn = screen.getByRole("button");
		expect(defaultBtn).toHaveStyle({ width: "25px", height: "25px" });
	});

	it("supports showLegend=false to hide scale legend and supports custom less/more labels", () => {
		const { rerender } = render(
			<HeatmapMatrix
				rowLabels={["Tier 1"]}
				columnLabels={["Col0"]}
				values={[[10]]}
				showLegend={false}
			/>,
		);

		// Cell and reading must still render correctly
		const btn = screen.getByRole("button");
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute("aria-label", "Tier 1, Col0: 10 (Heatmap matrix)");
		expect(screen.queryByText("Less")).not.toBeInTheDocument();
		expect(screen.queryByText("More")).not.toBeInTheDocument();

		// Rerender with custom less/more labels
		rerender(
			<HeatmapMatrix
				rowLabels={["Tier 1"]}
				columnLabels={["Col0"]}
				values={[[10]]}
				showLegend
				lessLabel="Min Activity"
				moreLabel="Max Activity"
			/>,
		);
		expect(screen.getByText("Min Activity")).toBeInTheDocument();
		expect(screen.getByText("Max Activity")).toBeInTheDocument();
	});

	it("clamps domain correctly, handles reversed/equal domain, and supports custom color scale", () => {
		const { rerender } = render(
			<HeatmapMatrix
				rowLabels={["Tier 1"]}
				columnLabels={["Low", "Mid", "High", "Extreme"]}
				values={[[-10, 50, 100, 200]]}
				domain={[100, 0]} // reversed domain normalized to [0, 100]
				colorScale={heatmapColorScales.red}
			/>,
		);

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(4);
		// Below min: clamps to 0
		expect(buttons[0]).toHaveStyle({ backgroundColor: heatmapColorScales.red[0] });
		// Above max: clamps to highest level
		expect(buttons[3]).toHaveStyle({
			backgroundColor: heatmapColorScales.red[heatmapColorScales.red.length - 1],
		});

		// Equal domain: [50, 50]
		rerender(
			<HeatmapMatrix
				rowLabels={["Tier 1"]}
				columnLabels={["Low", "Mid", "High", "Extreme"]}
				values={[[-10, 50, 100, 200]]}
				domain={[50, 50]}
				colorScale={heatmapColorScales.red}
			/>,
		);
		const rerenderedButtons = screen.getAllByRole("button");
		// <= 50 gives 0, > 50 gives highest level
		expect(rerenderedButtons[0]).toHaveStyle({ backgroundColor: heatmapColorScales.red[0] });
		expect(rerenderedButtons[1]).toHaveStyle({ backgroundColor: heatmapColorScales.red[0] });
		expect(rerenderedButtons[2]).toHaveStyle({
			backgroundColor: heatmapColorScales.red[heatmapColorScales.red.length - 1],
		});
	});

	it("handles non-finite domain, ragged rows, NaN, Infinity, and empty color scales gracefully", () => {
		render(
			<HeatmapMatrix
				rowLabels={["R0", "R1"]}
				columnLabels={["C0", "C1", "C2"]}
				values={[
					[Number.NaN, Number.POSITIVE_INFINITY], // ragged (2 items vs 3 cols)
					[10, Number.NEGATIVE_INFINITY, 20],
				]}
				domain={[Number.NaN, Number.POSITIVE_INFINITY]} // non-finite fallback
				colorScale={[]} // empty color scale fallback
			/>,
		);

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(6);
		// NaN and infinities are treated as missing data
		expect(buttons[0]).toHaveAttribute("aria-label", "R0, C0: — (Heatmap matrix)");
		expect(buttons[1]).toHaveAttribute("aria-label", "R0, C1: — (Heatmap matrix)");
		expect(buttons[2]).toHaveAttribute("aria-label", "R0, C2: — (Heatmap matrix)"); // missing from ragged row
		expect(buttons[3]).toHaveAttribute("aria-label", "R1, C0: 10 (Heatmap matrix)");
		expect(buttons[4]).toHaveAttribute("aria-label", "R1, C1: — (Heatmap matrix)");
		expect(buttons[5]).toHaveAttribute("aria-label", "R1, C2: 20 (Heatmap matrix)");
	});

	it("renders custom composable tooltip content using ChartTooltipRow/Summary/Divider", () => {
		render(
			<HeatmapMatrix
				rowLabels={["Cluster A"]}
				columnLabels={["Morning"]}
				values={[[42]]}
				metricLabel="QPS"
				renderTooltip={(cell) => (
					<div data-testid="custom-matrix-tooltip">
						<ChartTooltipRow label={cell.rowLabel} value={cell.value} unit="qps" />
						<ChartTooltipDivider />
						<ChartTooltipSummary label="Active Slot" value={cell.columnLabel} />
					</div>
				)}
			/>,
		);

		const cellBtn = screen.getByRole("button");
		fireEvent.focus(cellBtn);

		expect(screen.getByTestId("custom-matrix-tooltip")).toBeInTheDocument();
		expect(screen.getByTestId("chart-tooltip-row")).toHaveTextContent("Cluster A");
		expect(screen.getByTestId("chart-tooltip-row")).toHaveTextContent("42qps");
		expect(screen.getByRole("separator")).toBeInTheDocument();
		expect(screen.getByTestId("chart-tooltip-summary")).toHaveTextContent("Active Slot");
		expect(screen.getByTestId("chart-tooltip-summary")).toHaveTextContent("Morning");
	});

	it("handles empty matrix dimensions and preserves focus without stealing outside focus", () => {
		const { rerender } = render(
			<div>
				<button id="outside-button" type="button">
					Outside Focus
				</button>
				<HeatmapMatrix
					rowLabels={sampleRows}
					columnLabels={sampleCols}
					values={sampleValues}
					ariaLabel="Shrink Matrix"
				/>
			</div>,
		);

		const outsideBtn = screen.getByRole("button", { name: "Outside Focus" });
		const buttons = screen.getAllByRole("button"); // outsideBtn + 12 matrix buttons
		const matrixBtn11 = buttons[12]; // last matrix button

		act(() => {
			matrixBtn11?.focus();
		});
		expect(document.activeElement).toBe(matrixBtn11);

		// Shrink matrix to 1x1
		rerender(
			<div>
				<button id="outside-button" type="button">
					Outside Focus
				</button>
				<HeatmapMatrix
					rowLabels={["Single"]}
					columnLabels={["Only"]}
					values={[[99]]}
					ariaLabel="Shrink Matrix"
				/>
			</div>,
		);

		const singleBtn = screen.getAllByRole("button")[1];
		expect(document.activeElement).toBe(singleBtn);
		expect(singleBtn).toHaveAttribute("tabindex", "0");

		// Empty matrix -> focus safely moves to empty region container
		rerender(
			<div>
				<button id="outside-button" type="button">
					Outside Focus
				</button>
				<HeatmapMatrix rowLabels={[]} columnLabels={[]} values={[]} ariaLabel="Shrink Matrix" />
			</div>,
		);
		const emptyRegion = screen.getByTestId("heatmap-matrix");
		expect(document.activeElement).toBe(emptyRegion);

		// Restore matrix while focus was inside -> focus moves to restored active cell
		rerender(
			<div>
				<button id="outside-button" type="button">
					Outside Focus
				</button>
				<HeatmapMatrix
					rowLabels={["Single"]}
					columnLabels={["Only"]}
					values={[[99]]}
					ariaLabel="Shrink Matrix"
				/>
			</div>,
		);
		const restoredBtn = screen.getAllByRole("button")[1];
		expect(document.activeElement).toBe(restoredBtn);

		// Now move focus to outside button and verify shrinking/emptying does NOT steal focus
		act(() => {
			outsideBtn.focus();
		});
		expect(document.activeElement).toBe(outsideBtn);

		rerender(
			<div>
				<button id="outside-button" type="button">
					Outside Focus
				</button>
				<HeatmapMatrix rowLabels={[]} columnLabels={[]} values={[]} ariaLabel="Shrink Matrix" />
			</div>,
		);
		expect(document.activeElement).toBe(outsideBtn);

		// Non-empty rowLabels but empty columnLabels: renders empty region without hijacking outside focus
		rerender(
			<div>
				<button id="outside-button" type="button">
					Outside Focus
				</button>
				<HeatmapMatrix
					rowLabels={["RowOnly"]}
					columnLabels={[]}
					values={[]}
					ariaLabel="Empty Cols Matrix"
				/>
			</div>,
		);
		expect(document.activeElement).toBe(outsideBtn);

		// Restore columns while outside focus is active: must not steal focus
		rerender(
			<div>
				<button id="outside-button" type="button">
					Outside Focus
				</button>
				<HeatmapMatrix
					rowLabels={["RowOnly"]}
					columnLabels={["Col0"]}
					values={[[123]]}
					ariaLabel="Empty Cols Matrix"
				/>
			</div>,
		);
		expect(document.activeElement).toBe(outsideBtn);
	});

	it("supports keyboard Home, End, PageUp, PageDown, Escape, and bounds navigation with precise tooltips", () => {
		const onFocus = vi.fn((e: React.FocusEvent<HTMLDivElement>) => ({
			currentTarget: e.currentTarget,
			target: e.target,
		}));
		const onBlur = vi.fn((e: React.FocusEvent<HTMLDivElement>) => ({
			currentTarget: e.currentTarget,
			target: e.target,
			relatedTarget: e.relatedTarget,
		}));

		render(
			<div>
				<button id="outside-matrix-test" type="button">
					Outside Matrix Test
				</button>
				<HeatmapMatrix
					rowLabels={sampleRows}
					columnLabels={sampleCols}
					values={sampleValues}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			</div>,
		);

		const buttons = screen.getAllByRole("button");
		// buttons[0] is outside-matrix-test, 1..12 are matrix cells
		const btn0 = buttons[1]; // row 0, col 0 ("Mon, 00:00: 0")
		const btn3 = buttons[4]; // row 0, col 3 ("Mon, 18:00: 30")
		const btn8 = buttons[9]; // row 2, col 0 ("Wed, 00:00: 25")
		const btn11 = buttons[12]; // row 2, col 3 ("Wed, 18:00: 45")
		if (!btn0 || !btn3 || !btn8 || !btn11) throw new Error("buttons missing");

		// Actual focus using act
		act(() => {
			btn0.focus();
		});
		expect(document.activeElement).toBe(btn0);
		expect(onFocus).toHaveBeenCalled();
		expect(onFocus.mock.results[0]?.value.currentTarget).toBe(screen.getByTestId("heatmap-matrix"));
		expect(onFocus.mock.results[0]?.value.target).toBe(btn0);

		// Tooltip opens on focus with exact visible reading (metric prefix + value, distinct from col label)
		const tooltipEl = screen.getByRole("tooltip");
		expect(tooltipEl).toBeInTheDocument();
		expect(tooltipEl).toHaveTextContent("Mon · 00:00");
		expect(tooltipEl).toHaveTextContent("Heatmap matrix: 0");

		// Escape closes tooltip while maintaining cell focus
		fireEvent.keyDown(btn0, { key: "Escape" });
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		expect(btn0).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn0);

		// End -> last col in current row (col 3: index 3)
		fireEvent.keyDown(btn0, { key: "End" });
		expect(btn3).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn3);
		expect(screen.getByRole("tooltip")).toHaveTextContent("Mon · 18:00");
		expect(screen.getByRole("tooltip")).toHaveTextContent("Heatmap matrix: 30");

		// PageDown -> last row in current col (row 2, col 3: index 11)
		fireEvent.keyDown(btn3, { key: "PageDown" });
		expect(btn11).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn11);
		expect(screen.getByRole("tooltip")).toHaveTextContent("Wed · 18:00");
		expect(screen.getByRole("tooltip")).toHaveTextContent("Heatmap matrix: 45");

		// Home -> first col in current row (row 2, col 0: index 8)
		fireEvent.keyDown(btn11, { key: "Home" });
		expect(btn8).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn8);
		expect(screen.getByRole("tooltip")).toHaveTextContent("Wed · 00:00");
		expect(screen.getByRole("tooltip")).toHaveTextContent("Heatmap matrix: 25");

		// PageUp -> first row in current col (row 0, col 0: index 0)
		fireEvent.keyDown(btn8, { key: "PageUp" });
		expect(btn0).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn0);

		// ArrowLeft at col 0 stays at col 0
		fireEvent.keyDown(btn0, { key: "ArrowLeft" });
		expect(btn0).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn0);

		// ArrowUp at row 0 stays at row 0
		fireEvent.keyDown(btn0, { key: "ArrowUp" });
		expect(btn0).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn0);

		// Unknown key does not trigger preventDefault
		const unhandledEvt = new KeyboardEvent("keydown", {
			key: "a",
			bubbles: true,
			cancelable: true,
		});
		btn0.dispatchEvent(unhandledEvt);
		expect(unhandledEvt.defaultPrevented).toBe(false);
		expect(btn0).toHaveAttribute("tabindex", "0");
		expect(document.activeElement).toBe(btn0);

		// Focus moves to outside button -> caller onBlur called with event
		const outsideBtn = screen.getByRole("button", { name: "Outside Matrix Test" });
		act(() => {
			outsideBtn.focus();
		});
		expect(document.activeElement).toBe(outsideBtn);
		expect(onBlur).toHaveBeenCalled();
		const lastBlur = onBlur.mock.results[onBlur.mock.results.length - 1]?.value;
		expect(lastBlur.currentTarget).toBe(screen.getByTestId("heatmap-matrix"));
		expect(lastBlur.relatedTarget).toBe(outsideBtn);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("calls caller onKeyDown on the root container and respects preventDefault", () => {
		const callerKeyDown = vi.fn((e: React.KeyboardEvent<HTMLDivElement>) => {
			expect(e.currentTarget).toBe(screen.getByTestId("heatmap-matrix"));
			expect(e.defaultPrevented).toBe(false);
			// Prevent default to cancel internal navigation
			e.preventDefault();
		});

		render(
			<HeatmapMatrix
				rowLabels={sampleRows}
				columnLabels={sampleCols}
				values={sampleValues}
				onKeyDown={callerKeyDown}
			/>,
		);

		const buttons = screen.getAllByRole("button");
		const targetBtn = buttons[0];
		if (!targetBtn) throw new Error("buttons[0] missing");
		targetBtn.focus();

		fireEvent.keyDown(targetBtn, { key: "ArrowRight" });
		expect(callerKeyDown).toHaveBeenCalled();
		// Because caller prevented default, navigation must not occur: buttons[0] remains active
		expect(buttons[0]).toHaveAttribute("tabindex", "0");
		expect(buttons[1]).toHaveAttribute("tabindex", "-1");
	});

	it("handles completely empty rows in ragged values matrix and preserves focus and labels", () => {
		// Valid typed inputs where rowLabels have 2 rows but values only provide row 1 (row 0 omitted),
		// or where all visible values are missing/null, ensuring clean domain derivation fallback to [0, 0]
		const raggedValues: readonly (readonly (number | null | undefined)[])[] = [
			[], // row 0 empty
			[null, 42], // row 1 partial
		];
		const { rerender } = render(
			<HeatmapMatrix
				rowLabels={["EmptyRow", "ActiveRow"]}
				columnLabels={["Col0", "Col1"]}
				values={raggedValues}
				metricLabel="Ragged metric"
			/>,
		);

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(4);
		// Empty row cells render as missing
		expect(buttons[0]).toHaveAttribute("aria-label", "EmptyRow, Col0: — (Ragged metric)");
		expect(buttons[1]).toHaveAttribute("aria-label", "EmptyRow, Col1: — (Ragged metric)");
		expect(buttons[2]).toHaveAttribute("aria-label", "ActiveRow, Col0: — (Ragged metric)");
		expect(buttons[3]).toHaveAttribute("aria-label", "ActiveRow, Col1: 42 (Ragged metric)");

		// When rowLabels are provided but values is completely empty [] (all rows missing)
		rerender(
			<HeatmapMatrix
				rowLabels={["R0", "R1"]}
				columnLabels={["C0", "C1"]}
				values={[]}
				metricLabel="All Missing"
			/>,
		);
		const allMissingButtons = screen.getAllByRole("button");
		expect(allMissingButtons).toHaveLength(4);
		expect(allMissingButtons[0]).toHaveAttribute("aria-label", "R0, C0: — (All Missing)");
		expect(allMissingButtons[3]).toHaveAttribute("aria-label", "R1, C1: — (All Missing)");
	});

	it("supports object ref and callback ref with React 19 cleanup and stability across renders", () => {
		// 1. Object ref
		const objRef = createRef<HTMLDivElement>();
		const { unmount: unmountObj } = render(
			<HeatmapMatrix
				ref={objRef}
				rowLabels={sampleRows}
				columnLabels={sampleCols}
				values={sampleValues}
			/>,
		);
		expect(objRef.current).toBeInstanceOf(HTMLDivElement);
		unmountObj();
		expect(objRef.current).toBeNull();

		// 2. React 19 callback ref with cleanup function
		const cleanupFn = vi.fn();
		const refCallback = vi.fn((node: HTMLDivElement | null) => {
			if (node) return cleanupFn;
		});

		const { rerender, unmount: unmountCb } = render(
			<HeatmapMatrix
				ref={refCallback}
				rowLabels={sampleRows}
				columnLabels={sampleCols}
				values={sampleValues}
			/>,
		);

		// Initially attached once
		expect(refCallback).toHaveBeenCalledTimes(1);
		expect(cleanupFn).toHaveBeenCalledTimes(0);

		// Rerender with same ref should NOT trigger re-attachment when callback identity is stable
		rerender(
			<HeatmapMatrix
				ref={refCallback}
				rowLabels={sampleRows}
				columnLabels={sampleCols}
				values={sampleValues}
				ariaLabel="Updated Label"
			/>,
		);
		expect(refCallback).toHaveBeenCalledTimes(1);
		expect(cleanupFn).toHaveBeenCalledTimes(0);

		// Unmount invokes cleanup exactly once without redundant ref(null)
		unmountCb();
		expect(cleanupFn).toHaveBeenCalledTimes(1);

		// 3. Legacy callback ref returning null / undefined
		const legacyCallback = vi.fn();
		const { unmount: unmountLegacy } = render(
			<HeatmapMatrix
				ref={legacyCallback}
				rowLabels={sampleRows}
				columnLabels={sampleCols}
				values={sampleValues}
			/>,
		);
		expect(legacyCallback).toHaveBeenCalledWith(expect.any(HTMLDivElement));
		unmountLegacy();
		expect(legacyCallback).toHaveBeenCalledWith(null);

		// 4. Ref replacement invokes previous cleanup and attaches to new ref
		const firstCleanup = vi.fn();
		const firstRef = vi.fn(() => firstCleanup);
		const secondCleanup = vi.fn();
		const secondRef = vi.fn(() => secondCleanup);

		const { rerender: rerenderSwitch, unmount: unmountSwitch } = render(
			<HeatmapMatrix
				ref={firstRef}
				rowLabels={sampleRows}
				columnLabels={sampleCols}
				values={sampleValues}
			/>,
		);
		expect(firstRef).toHaveBeenCalledTimes(1);
		expect(firstCleanup).toHaveBeenCalledTimes(0);

		rerenderSwitch(
			<HeatmapMatrix
				ref={secondRef}
				rowLabels={sampleRows}
				columnLabels={sampleCols}
				values={sampleValues}
			/>,
		);
		expect(firstCleanup).toHaveBeenCalledTimes(1);
		expect(secondRef).toHaveBeenCalledTimes(1);

		unmountSwitch();
		expect(secondCleanup).toHaveBeenCalledTimes(1);
	});

	it("adjusts scrollContainer.scrollLeft when navigating left and right to prevent sticky header occlusion", () => {
		const longCols = ["C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7"] as const;
		const rowData = [["RowA"], longCols, [[1, 2, 3, 4, 5, 6, 7, 8]]] as const;

		const { container } = render(
			<HeatmapMatrix
				rowLabels={rowData[0]}
				columnLabels={rowData[1]}
				values={rowData[2]}
				cellSize={20}
				columnWidth={60}
			/>,
		);

		const scrollContainer = container.querySelector<HTMLElement>(
			'[role="region"][aria-label$="scrollable table"]',
		);
		if (!scrollContainer) throw new Error("scrollContainer missing");

		// Mock bounding rects for container and rowHeader
		vi.spyOn(scrollContainer, "getBoundingClientRect").mockReturnValue({
			left: 0,
			right: 200,
			top: 0,
			bottom: 100,
			width: 200,
			height: 100,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		});

		const rowHeader = container.querySelector<HTMLElement>('th[scope="row"]');
		if (!rowHeader) throw new Error("rowHeader missing");
		vi.spyOn(rowHeader, "getBoundingClientRect").mockReturnValue({
			left: 0,
			right: 64, // sticky header width = 64
			top: 0,
			bottom: 20,
			width: 64,
			height: 20,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		});

		const buttons = screen.getAllByRole("button");
		const firstCell = buttons[0];
		const lastCell = buttons[7];
		if (!firstCell || !lastCell) throw new Error("cells missing");

		// 1. Rightward scroll: button rect right is beyond container right (250 > 200)
		vi.spyOn(lastCell, "getBoundingClientRect").mockReturnValue({
			left: 190,
			right: 250,
			top: 0,
			bottom: 20,
			width: 60,
			height: 20,
			x: 190,
			y: 0,
			toJSON: () => ({}),
		});

		scrollContainer.scrollLeft = 0;
		act(() => {
			firstCell.focus();
		});

		fireEvent.keyDown(firstCell, { key: "End" });
		// scrollContainer.scrollLeft must have increased by exactly 250 - 200 + cellGap(2) = 52
		expect(scrollContainer.scrollLeft).toBe(52);
		expect(document.activeElement).toBe(lastCell);

		// 2. Leftward scroll: button rect left is behind sticky header (40 < 64)
		// scrollLeft must decrease by 64 - 40 + cellGap(2) = 26
		const currentScroll = scrollContainer.scrollLeft;
		vi.spyOn(firstCell, "getBoundingClientRect").mockReturnValue({
			left: 40,
			right: 100,
			top: 0,
			bottom: 20,
			width: 60,
			height: 20,
			x: 40,
			y: 0,
			toJSON: () => ({}),
		});

		fireEvent.keyDown(lastCell, { key: "Home" });
		expect(scrollContainer.scrollLeft).toBe(currentScroll - 26);
		expect(document.activeElement).toBe(firstCell);
	});
});
