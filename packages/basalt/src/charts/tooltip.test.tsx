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
