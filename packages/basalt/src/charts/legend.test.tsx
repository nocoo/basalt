import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartLegend } from "./legend";

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
		expect(legend).toHaveStyle({ fontSize: "12px" });
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
