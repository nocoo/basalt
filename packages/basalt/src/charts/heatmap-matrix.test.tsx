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
	});

	it("supports keyboard Home, End, PageUp, PageDown and closes tooltip on Escape", async () => {
		render(
			<HeatmapMatrix rowLabels={sampleRows} columnLabels={sampleCols} values={sampleValues} />,
		);

		const buttons = screen.getAllByRole("button");
		const btn0 = buttons[0];
		const btn3 = buttons[3];
		const btn8 = buttons[8];
		const btn11 = buttons[11];
		if (!btn0 || !btn3 || !btn8 || !btn11) throw new Error("buttons missing");

		fireEvent.focus(btn0);

		// Tooltip opens on focus
		expect(screen.getByRole("tooltip")).toBeInTheDocument();

		// Escape closes tooltip while maintaining cell focus
		fireEvent.keyDown(btn0, { key: "Escape" });
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		expect(btn0).toHaveAttribute("tabindex", "0");

		// Navigation re-opens tooltip at new cell
		fireEvent.keyDown(btn0, { key: "End" });
		expect(btn3).toHaveAttribute("tabindex", "0");

		// PageDown -> last row in current col (row 2, col 3: index 11)
		fireEvent.keyDown(btn3, { key: "PageDown" });
		expect(btn11).toHaveAttribute("tabindex", "0");

		// Home -> first col in current row (row 2, col 0: index 8)
		fireEvent.keyDown(btn11, { key: "Home" });
		expect(btn8).toHaveAttribute("tabindex", "0");

		// PageUp -> first row in current col (row 0, col 0: index 0)
		fireEvent.keyDown(btn8, { key: "PageUp" });
		expect(btn0).toHaveAttribute("tabindex", "0");
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
	});
});
