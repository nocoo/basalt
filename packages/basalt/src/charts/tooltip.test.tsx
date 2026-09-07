import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { chartTooltipProps } from "./config";
import {
	ChartTooltipContent,
	ChartTooltipDivider,
	ChartTooltipRow,
	ChartTooltipSummary,
	formatChartNumber,
} from "./tooltip";

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
			background: "rgb(1, 2, 3)",
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
			background: "rgb(4, 5, 6)",
		});
		rerender(
			<ChartTooltipContent active payload={[{ name: "A", value: 1, stroke: "rgb(7, 8, 9)" }]} />,
		);
		expect(
			screen.getByTestId("chart-tooltip").querySelector("span[aria-hidden='true']"),
		).toHaveStyle({
			background: "rgb(7, 8, 9)",
		});
		rerender(<ChartTooltipContent active payload={[{ name: "A", value: 1 }]} />);
		expect(
			screen.getByTestId("chart-tooltip").querySelector("span[aria-hidden='true']"),
		).toHaveStyle({
			background: "hsl(var(--basalt-chart-1))",
		});
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
			background: "rgb(255, 0, 0)",
		});
	});

	it("preserves numeric 0 for label and value independently in ChartTooltipRow", () => {
		const { rerender } = render(<ChartTooltipRow label={0} value="Ready" />);
		const row = screen.getByTestId("chart-tooltip-row");
		expect(row).toHaveTextContent("0Ready");

		rerender(<ChartTooltipRow label="Power" value={0} unit="%" />);
		expect(screen.getByTestId("chart-tooltip-row")).toHaveTextContent("Power0%");
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
