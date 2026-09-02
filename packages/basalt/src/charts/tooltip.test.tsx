import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartTooltipContent, formatChartNumber } from "./tooltip";

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
