import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartLegend } from "./legend";

describe("ChartLegend", () => {
	it("renders series labels with the shared type size", () => {
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

	it("renders nothing without items", () => {
		const { container } = render(<ChartLegend items={[]} />);
		expect(container).toBeEmptyDOMElement();
	});
});
