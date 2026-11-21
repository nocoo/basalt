import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	ANIMATION_PROPS,
	AXIS_CONFIG,
	applyLeadColor,
	BAR_RADIUS,
	CHART_COLORS,
	CHART_TOOLTIP_CURSOR_BAR,
	CHART_TOOLTIP_CURSOR_LINE,
	CHART_TYPE,
	ChartFrame,
	ChartLegend,
	ChartPalette,
	ChartShell,
	ChartTooltipContent,
	ChartTooltipDivider,
	ChartTooltipRow,
	ChartTooltipSummary,
	cartesianAxisProps,
	chartAxis,
	chartFontSize,
	chartTextStyle,
	chartTickStyle,
	chartTooltipContentStyle,
	chartTooltipProps,
	formatChartNumber,
	GRID_PROPS,
	getChartColor,
	resolveChartSeries,
	seriesColor,
	withAlpha,
	xyFallbackKeys,
} from "./chart";

describe("ChartFrame", () => {
	it("renders summary, alternative, legend, and slot zero", () => {
		const { rerender } = render(
			<ChartShell
				ariaLabel="Requests"
				summary="Requests rose"
				dataAlternative={
					<table>
						<tbody>
							<tr>
								<td>4</td>
							</tr>
						</tbody>
					</table>
				}
				legend={<span>Legend</span>}
			>
				<svg aria-label="Requests plot" />
			</ChartShell>,
		);
		const figure = screen.getByRole("group", { name: "Requests" });
		expect(figure).toHaveAttribute("aria-describedby");
		expect(screen.getByText("Requests rose")).toBeInTheDocument();
		expect(screen.getByText("Legend")).toBeInTheDocument();
		expect(screen.getByTestId("chart-shell")).toBeInTheDocument();
		rerender(
			<ChartFrame ariaLabel="Zero" summary={0} dataAlternative={0} legend={0}>
				<div>Plot</div>
			</ChartFrame>,
		);
		expect(screen.getAllByText("0")).toHaveLength(3);
	});

	it("does not forward accessibility props to fragments", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		try {
			render(
				<ChartFrame ariaLabel="Fragment plot" accessibilityLayer={false}>
					{/* biome-ignore lint/complexity/noUselessFragments: regression coverage requires a Fragment child */}
					<>
						<svg aria-label="Plot" />
					</>
				</ChartFrame>,
			);
			expect(screen.getByLabelText("Plot")).toBeInTheDocument();
			expect(error).not.toHaveBeenCalled();
		} finally {
			error.mockRestore();
		}
	});

	it("passes an optional accessibility layer flag to a component child", () => {
		function Plot({ accessibilityLayer }: { accessibilityLayer?: boolean }) {
			return <div data-layer={String(accessibilityLayer)}>Plot</div>;
		}
		render(
			<ChartFrame ariaLabel="Accessible" accessibilityLayer={false}>
				<Plot />
			</ChartFrame>,
		);
		expect(screen.getByText("Plot")).toHaveAttribute("data-layer", "false");
	});

	it("gives legend shells sole ownership of caller geometry", () => {
		const { container } = render(
			<ChartFrame
				ariaLabel="Geometry"
				size="w-1/2 h-basalt-36"
				className="p-basalt-card"
				legend={0}
			>
				<div>Plot</div>
			</ChartFrame>,
		);
		const shell = screen.getByTestId("chart-shell");
		const plot = container.querySelector(".basalt-chart");
		expect(shell).toHaveClass("w-1/2", "h-basalt-36", "p-basalt-card", "flex-col");
		expect(shell).toHaveTextContent("0");
		expect(plot).toHaveClass("w-full", "min-h-0", "min-w-0", "flex-1", "basalt-chart");
		expect(plot).not.toHaveClass("w-1/2", "h-basalt-36", "p-basalt-card");
	});

	it("supports plain plot and data alternative without summary", () => {
		const { rerender } = render(
			<ChartFrame ariaLabel="Plain" className="custom" size="h-24 w-48">
				<div>Plot</div>
			</ChartFrame>,
		);
		expect(screen.getByRole("group", { name: "Plain" })).toHaveClass("contents");
		expect(screen.getByText("Plot").parentElement).toHaveClass("custom", "h-24", "w-48");
		rerender(
			<ChartFrame ariaLabel="Alternative" dataAlternative="Table follows">
				<div>Plot</div>
			</ChartFrame>,
		);
		expect(screen.getByRole("group", { name: "Alternative" })).not.toHaveAttribute(
			"aria-describedby",
		);
	});
});

describe("Chart palette and config", () => {
	it("renders palette swatches", () => {
		render(<ChartPalette ariaLabel="Series colors" />);
		expect(screen.getByRole("img", { name: "Series colors" }).children).toHaveLength(5);
	});

	it("covers tooltip cursor and plot constants", () => {
		expect(CHART_TOOLTIP_CURSOR_LINE.stroke).toBe(chartAxis);
		expect(CHART_TOOLTIP_CURSOR_BAR.fill).toContain("foreground");
		expect(chartTooltipProps({ cursor: false }).cursor).toBe(false);
		expect(chartTooltipProps({ cursor: "line" }).cursor).toBe(CHART_TOOLTIP_CURSOR_LINE);
		expect(chartTooltipProps({ cursor: "bar" }).cursor).toBe(CHART_TOOLTIP_CURSOR_BAR);
		const defaultContent = chartTooltipProps({ formatter: (v) => `$${v}` }).content as (
			props: unknown,
		) => React.ReactElement;
		render(defaultContent({ active: true, payload: [{ value: 2 }], label: "A" }));
		expect(screen.getByTestId("chart-tooltip")).toHaveTextContent("$2");
	});
});

describe("ChartTooltipContent", () => {
	it("renders a titled panel with a swatch and formatted value", () => {
		render(
			<ChartTooltipContent
				active
				label="Mar"
				payload={[{ name: "Income", value: 4200, color: "rgb(1, 2, 3)" }]}
			/>,
		);
		const root = screen.getByTestId("chart-tooltip");
		expect(root).toHaveTextContent("Mar");
		expect(root).toHaveTextContent("Income");
		expect(root).toHaveTextContent(formatChartNumber(4200));
		expect(root.querySelector("span[aria-hidden='true']")).toHaveStyle({
			backgroundColor: "rgb(1, 2, 3)",
		});
	});

	it("delegates to customTooltip renderer when provided", () => {
		const custom = vi.fn(({ active, payload, label }) => {
			return active ? (
				<div data-testid="my-custom-tooltip">
					{label}: {payload?.[0]?.value}
				</div>
			) : null;
		});
		const props = chartTooltipProps({ customTooltip: custom });
		expect(typeof props.content).toBe("function");
		const ContentFn = props.content as (p: unknown) => React.ReactElement;
		const contentElement = ContentFn({
			active: true,
			payload: [{ dataKey: "requests", value: 42 }],
			label: "Wednesday",
		});
		render(contentElement);
		expect(custom).toHaveBeenCalledWith(
			expect.objectContaining({
				active: true,
				label: "Wednesday",
				payload: expect.arrayContaining([
					expect.objectContaining({ dataKey: "requests", value: 42 }),
				]),
			}),
		);
		expect(screen.getByTestId("my-custom-tooltip")).toHaveTextContent("Wednesday: 42");
	});

	it("hides internal series keys and trims long floats", () => {
		render(
			<ChartTooltipContent
				active
				label="20"
				payload={[{ name: "y", dataKey: "y", value: 7896.468834281469, color: "#00f" }]}
			/>,
		);
		expect(screen.getByTestId("chart-tooltip")).not.toHaveTextContent("y");
		expect(screen.getByTestId("chart-tooltip")).toHaveTextContent(
			formatChartNumber(7896.468834281469),
		);
	});

	it("uses the caller formatter", () => {
		render(
			<ChartTooltipContent
				active
				label="Jan"
				formatter={(value) => `$${value}`}
				payload={[{ name: "Spend", value: 12000, color: "#111" }]}
			/>,
		);
		expect(screen.getByTestId("chart-tooltip")).toHaveTextContent("$12000");
	});

	it("renders nothing when inactive", () => {
		const { container } = render(<ChartTooltipContent payload={[{ value: 1 }]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders nothing for an empty payload", () => {
		const { container } = render(<ChartTooltipContent active payload={[]} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("omits the title when the label is empty", () => {
		render(
			<ChartTooltipContent
				active
				label=""
				payload={[{ name: "Income", value: 12, color: "#111" }]}
			/>,
		);
		expect(screen.getByTestId("chart-tooltip").querySelector("p")).toBeNull();
	});

	it("treats a missing name as unlabeled", () => {
		render(
			<ChartTooltipContent active payload={[{ dataKey: "spend", value: 9, color: "#111" }]} />,
		);
		expect(screen.getByTestId("chart-tooltip")).toHaveTextContent("9");
		expect(screen.getByTestId("chart-tooltip")).not.toHaveTextContent("spend");
	});

	it("keys a row by index when name and dataKey are missing", () => {
		render(<ChartTooltipContent active payload={[{ value: 3, color: "#111" }]} />);
		expect(screen.getByTestId("chart-tooltip")).toHaveTextContent("3");
	});

	it("hides a payload whose dataKey is an internal series key", () => {
		render(
			<ChartTooltipContent
				active
				label="Mon"
				payload={[{ name: "Income", dataKey: "y2", value: 10, color: "#111" }]}
			/>,
		);
		expect(screen.getByTestId("chart-tooltip")).not.toHaveTextContent("Income");
		expect(screen.getByTestId("chart-tooltip")).toHaveTextContent("10");
	});

	it("falls back through fill, stroke, and the chart token for the swatch", () => {
		const { rerender } = render(
			<ChartTooltipContent active payload={[{ name: "A", value: 1, fill: "rgb(4, 5, 6)" }]} />,
		);
		expect(
			screen.getByTestId("chart-tooltip").querySelector("span[aria-hidden='true']"),
		).toHaveStyle({
			backgroundColor: "rgb(4, 5, 6)",
		});
		rerender(
			<ChartTooltipContent active payload={[{ name: "A", value: 1, stroke: "rgb(7, 8, 9)" }]} />,
		);
		expect(
			screen.getByTestId("chart-tooltip").querySelector("span[aria-hidden='true']"),
		).toHaveStyle({
			backgroundColor: "rgb(7, 8, 9)",
		});
		rerender(<ChartTooltipContent active payload={[{ name: "A", value: 1 }]} />);
		const fallbackSwatch = screen
			.getByTestId("chart-tooltip")
			.querySelector("span[aria-hidden='true']") as HTMLSpanElement;
		expect(fallbackSwatch.style.background).toBe("hsl(var(--basalt-chart-1))");
	});

	it("stringifies non-numeric values and numeric strings", () => {
		render(
			<ChartTooltipContent
				active
				payload={[
					{ name: "A", value: "12.5", color: "#111" },
					{ name: "B", value: undefined, color: "#222" },
				]}
			/>,
		);
		expect(screen.getByTestId("chart-tooltip")).toHaveTextContent(formatChartNumber(12.5));
		expect(screen.getByTestId("chart-tooltip")).toHaveTextContent("—");
	});
});

describe("formatChartNumber", () => {
	it("keeps integers and caps fractions", () => {
		expect(formatChartNumber(8800)).toBe(
			new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(8800),
		);
		expect(formatChartNumber(12.34)).toBe(
			new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(12.34),
		);
		expect(formatChartNumber(Number.NaN)).toBe("—");
	});
});

describe("Composable ChartTooltip primitives", () => {
	it("renders ChartTooltipRow with label, formatted value, color dot, and unit", () => {
		render(<ChartTooltipRow label="Latency" value={42} unit="ms" color="rgb(255, 0, 0)" />);
		const row = screen.getByTestId("chart-tooltip-row");
		expect(row).toHaveTextContent("Latency");
		expect(row).toHaveTextContent("42ms");
		expect(row.querySelector("span[aria-hidden='true']")).toHaveStyle({
			backgroundColor: "rgb(255, 0, 0)",
		});
	});

	it("preserves numeric 0 for label and value independently in ChartTooltipRow", () => {
		const { rerender } = render(<ChartTooltipRow label={0} value="Ready" />);
		const row = screen.getByTestId("chart-tooltip-row");
		expect(row).toHaveTextContent("0 Ready");

		rerender(<ChartTooltipRow label="Power" value={0} unit="%" />);
		expect(screen.getByTestId("chart-tooltip-row")).toHaveTextContent("Power 0%");
	});

	it("renders placeholder — when value is null or undefined without unit", () => {
		const { rerender } = render(<ChartTooltipRow label="Missing" value={null} unit="ms" />);
		const row = screen.getByTestId("chart-tooltip-row");
		expect(row).toHaveTextContent("Missing");
		expect(row).toHaveTextContent("—");
		expect(row).not.toHaveTextContent("—ms");

		rerender(<ChartTooltipRow label="Undefined" value={undefined} unit="ms" />);
		expect(screen.getByTestId("chart-tooltip-row")).toHaveTextContent("—");
		expect(screen.getByTestId("chart-tooltip-row")).not.toHaveTextContent("—ms");
	});

	it("supports custom formatter and hideIndicator in ChartTooltipRow", () => {
		render(
			<ChartTooltipRow label="Custom" value={1200} formatter={(v) => `$${v}`} hideIndicator />,
		);
		const row = screen.getByTestId("chart-tooltip-row");
		expect(row).toHaveTextContent("Custom");
		expect(row).toHaveTextContent("$1200");
		expect(row.querySelector("span[aria-hidden='true']")).toBeNull();
	});

	it("forwards native div props including aria, data, id, and style to ChartTooltipRow", () => {
		render(
			<ChartTooltipRow
				id="custom-row-id"
				data-key="metric-key"
				aria-label="custom row"
				label="Row"
				value={10}
				style={{ opacity: 0.8 }}
			/>,
		);
		const row = screen.getByTestId("chart-tooltip-row");
		expect(row).toHaveAttribute("id", "custom-row-id");
		expect(row).toHaveAttribute("data-key", "metric-key");
		expect(row).toHaveAttribute("aria-label", "custom row");
		expect(row).toHaveStyle({ opacity: 0.8 });
	});

	it("renders ChartTooltipDivider as horizontal separator hr and forwards native props", () => {
		render(
			<ChartTooltipDivider id="custom-divider" data-section="totals" style={{ marginTop: 8 }} />,
		);
		const divider = screen.getByRole("separator");
		expect(divider.tagName).toBe("HR");
		expect(divider).toHaveAttribute("id", "custom-divider");
		expect(divider).toHaveAttribute("data-section", "totals");
		expect(divider).toHaveAttribute("aria-orientation", "horizontal");
		expect(divider).toHaveStyle({ marginTop: "8px" });
	});

	it("renders ChartTooltipSummary with default and custom label, unit, and preserves 0", () => {
		const { rerender } = render(<ChartTooltipSummary value={150} unit="req/s" />);
		const summary = screen.getByTestId("chart-tooltip-summary");
		expect(summary).toHaveTextContent("Total");
		expect(summary).toHaveTextContent("150req/s");

		rerender(<ChartTooltipSummary label="Grand Total" value={0} unit="req/s" />);
		expect(screen.getByTestId("chart-tooltip-summary")).toHaveTextContent("Grand Total");
		expect(screen.getByTestId("chart-tooltip-summary")).toHaveTextContent("0req/s");

		rerender(<ChartTooltipSummary label={0} value={null} unit="req/s" />);
		expect(screen.getByTestId("chart-tooltip-summary")).toHaveTextContent("0");
		expect(screen.getByTestId("chart-tooltip-summary")).toHaveTextContent("—");
	});

	it("forwards native div props to ChartTooltipSummary", () => {
		render(
			<ChartTooltipSummary
				id="summary-id"
				data-metric="total"
				aria-live="polite"
				value={100}
				style={{ padding: 4 }}
			/>,
		);
		const summary = screen.getByTestId("chart-tooltip-summary");
		expect(summary).toHaveAttribute("id", "summary-id");
		expect(summary).toHaveAttribute("data-metric", "total");
		expect(summary).toHaveAttribute("aria-live", "polite");
		expect(summary).toHaveStyle({ padding: "4px" });
	});

	it("omits label element when label is null or undefined in ChartTooltipRow and ChartTooltipSummary", () => {
		// Row without label
		const { rerender } = render(
			<ChartTooltipRow value={55} unit="ms" data-testid="row-no-label" />,
		);
		const row = screen.getByTestId("row-no-label");
		expect(row.textContent?.trim()).toBe("55ms");

		// Summary without label: must omit default "Total" and render exact "99ms"
		rerender(<ChartTooltipSummary label={null} value={99} unit="ms" data-testid="sum-no-label" />);
		const sum = screen.getByTestId("sum-no-label");
		expect(sum.textContent?.trim()).toBe("99ms");
		expect(sum).not.toHaveTextContent("Total");
	});

	it("formats numeric value with custom formatter in ChartTooltipSummary and handles null unit", () => {
		render(<ChartTooltipSummary value={5000} formatter={(v) => `$${v}`} unit={null} />);
		const sum = screen.getByTestId("chart-tooltip-summary");
		expect(sum).toHaveTextContent("Total");
		expect(sum).toHaveTextContent("$5000");
	});
});

describe("ChartLegend", () => {
	it("renders series labels with the shared type size and supports bar shape", () => {
		render(
			<ChartLegend
				items={[
					{ key: "y", label: "Income", color: "rgb(1, 2, 3)" },
					{ key: "y2", label: "Expense" },
				]}
				shape="bar"
			/>,
		);
		const legend = screen.getByTestId("chart-legend");
		expect(legend.style.fontSize).toBe("var(--basalt-text-sm)");
		expect(screen.getByText("Income")).toBeInTheDocument();
		expect(screen.getByText("Expense")).toBeInTheDocument();
		expect(legend.querySelector("rect")).toHaveAttribute("fill", "rgb(1, 2, 3)");
	});

	it("renders area shape with polygon element and line shape with line element", () => {
		const { rerender } = render(
			<ChartLegend
				items={[{ key: "areaKey", label: "AreaLabel", color: "rgb(10, 20, 30)" }]}
				shape="area"
			/>,
		);
		const polygon = screen.getByTestId("chart-legend").querySelector("polygon");
		expect(polygon).toBeInTheDocument();
		expect(polygon).toHaveAttribute("fill", "rgb(10, 20, 30)");

		// Default shape: line
		rerender(
			<ChartLegend items={[{ key: "lineKey", label: "LineLabel", color: "rgb(40, 50, 60)" }]} />,
		);
		const line = screen.getByTestId("chart-legend").querySelector("line");
		expect(line).toBeInTheDocument();
		expect(line).toHaveAttribute("stroke", "rgb(40, 50, 60)");
	});

	it("falls back to item.key when label is omitted", () => {
		render(<ChartLegend items={[{ key: "rawKeyOnly" }]} />);
		expect(screen.getByText("rawKeyOnly")).toBeInTheDocument();
	});

	it("renders nothing without items", () => {
		const { container } = render(<ChartLegend items={[]} />);
		expect(container).toBeEmptyDOMElement();
	});
});

describe("chart type helpers", () => {
	it("shares the auxiliary tier across axis ticks, legend and tooltip", () => {
		expect(chartFontSize("axis")).toBe("var(--basalt-text-sm)");
		expect(chartFontSize("legend")).toBe("var(--basalt-text-sm)");
		expect(chartFontSize("tooltipTitle")).toBe("var(--basalt-text-sm)");
		expect(chartFontSize("tooltipBody")).toBe("var(--basalt-text-sm)");
		expect(chartTextStyle("axis")).toEqual({ fontSize: "var(--basalt-text-sm)" });
	});

	it("paints ticks with the axis token", () => {
		expect(chartTickStyle()).toEqual({ fontSize: "var(--basalt-text-sm)", fill: chartAxis });
		expect(AXIS_CONFIG.axisLine).toBe(false);
		expect(AXIS_CONFIG.tickLine).toBe(false);
		expect(AXIS_CONFIG.tick).toEqual({ fontSize: "var(--basalt-text-sm)", fill: chartAxis });
		expect(cartesianAxisProps(true).hide).toBe(true);
	});

	it("styles grid, tooltip, and legend from the same type scale", () => {
		expect(GRID_PROPS.strokeDasharray).toBe(CHART_TYPE.gridDash);
		expect(GRID_PROPS.strokeOpacity).toBe(CHART_TYPE.gridOpacity);
		expect(chartTooltipContentStyle().padding).toBe("0");
		expect(chartTooltipContentStyle().background).toBe("transparent");
		expect(chartTooltipProps({ cursor: "line" }).wrapperStyle.outline).toBe("none");
		expect(chartTooltipProps({ cursor: "line" }).wrapperStyle.transition).toBe("none");
		expect(chartTooltipProps({ cursor: "line" }).content).toBeTypeOf("function");
		expect(BAR_RADIUS.vertical).toEqual([4, 4, 0, 0]);
		expect(ANIMATION_PROPS.isAnimationActive).toBe(false);
	});

	it("wraps palette colors and alpha tokens", () => {
		expect(getChartColor(0)).toBe(CHART_COLORS[0]);
		expect(getChartColor(CHART_COLORS.length)).toBe(CHART_COLORS[0]);
		expect(withAlpha("chart-axis", 0.15)).toBe("hsl(var(--basalt-chart-axis) / 0.15)");
		expect(seriesColor({ key: "y", color: "rgb(9, 8, 7)" }, 3)).toBe("rgb(9, 8, 7)");
		expect(seriesColor(undefined, 4)).toBe(CHART_COLORS[4]);
	});
});

describe("Chart series utilities", () => {
	it("resolveChartSeries returns series if non-empty, otherwise maps fallbackKeys", () => {
		const custom = [{ key: "metric1", label: "Metric 1" }];
		expect(resolveChartSeries(custom, ["defaultKey"])).toBe(custom);

		expect(resolveChartSeries([], ["fallbackA", "fallbackB"])).toEqual([
			{ key: "fallbackA" },
			{ key: "fallbackB" },
		]);

		expect(resolveChartSeries(undefined, ["y"])).toEqual([{ key: "y" }]);
	});

	it("applyLeadColor applies lead color only to index 0 when item.color is undefined, preserves existing color, keeps subsequent items unchanged, and does nothing without color", () => {
		const itemsWithoutColor = [{ key: "a" }, { key: "b", color: "rgb(0, 0, 255)" }];
		const colored = applyLeadColor(itemsWithoutColor, "rgb(255, 0, 0)");
		expect(colored[0]?.color).toBe("rgb(255, 0, 0)");
		// Non-first item is preserved exactly
		expect(colored[1]).toBe(itemsWithoutColor[1]);
		expect(colored[1]?.color).toBe("rgb(0, 0, 255)");

		// Does not overwrite existing item.color on index 0
		const itemsWithColor = [{ key: "a", color: "rgb(0, 255, 0)" }, { key: "b" }];
		const preserved = applyLeadColor(itemsWithColor, "rgb(255, 0, 0)");
		expect(preserved[0]?.color).toBe("rgb(0, 255, 0)");
		expect(preserved[1]).toBe(itemsWithColor[1]);

		// Returns items as-is when color is undefined
		expect(applyLeadColor(itemsWithoutColor, undefined)).toBe(itemsWithoutColor);
	});

	it("xyFallbackKeys inspects dataset for y2 and y3 presence", () => {
		expect(xyFallbackKeys([{}])).toEqual(["y"]);
		expect(xyFallbackKeys([{ y2: 20 }])).toEqual(["y", "y2"]);
		expect(xyFallbackKeys([{ y3: 30 }])).toEqual(["y", "y3"]);
		expect(xyFallbackKeys([{ y2: 20, y3: 30 }])).toEqual(["y", "y2", "y3"]);
	});
});
