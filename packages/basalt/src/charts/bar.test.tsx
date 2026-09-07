import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { cloneElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { BarChart } from "./bar";

vi.mock("recharts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("recharts")>();
	return {
		...actual,
		ResponsiveContainer: ({
			children,
		}: {
			children: React.ReactElement<{ width?: number; height?: number }>;
		}) => {
			return (
				<div data-testid="mock-responsive-container">
					{cloneElement(children, {
						width: 400,
						height: 250,
					})}
				</div>
			);
		},
	};
});

describe("BarChart", () => {
	const points = [
		{ x: "Jan", y: 12, y2: 18 },
		{ x: "Feb", y: 15, y2: 22 },
	];

	it("renders", () => {
		expect(render(<BarChart data={[{ x: "Jan", y: 12 }]} />).container.firstChild).toBeTruthy();
	});

	it("accepts page data and visible axes", () => {
		const { container } = render(
			<BarChart
				data={[{ x: "Jan", y: 12 }]}
				ariaLabel="Budget vs actual"
				showAxes
				className="h-40 w-full"
			/>,
		);
		expect(container.querySelector("[aria-label='Budget vs actual']")).toBeTruthy();
	});

	it("uses the caller color", () => {
		const { container } = render(
			<BarChart data={[{ x: "Jan", y: 12 }]} ariaLabel="Tinted" color="rgb(1, 2, 3)" />,
		);
		expect(container.querySelector('[aria-label="Tinted"]')).toBeTruthy();
	});

	it("supports custom legend renderer function and node", () => {
		const { rerender } = render(
			<BarChart
				data={points}
				series={[{ key: "y", label: "MetricA" }]}
				legend={({ items }) => (
					<div data-testid="custom-bar-legend">
						{items.map((it) => (
							<span key={it.key}>{it.label ?? it.key}</span>
						))}
					</div>
				)}
			/>,
		);
		expect(screen.getByTestId("custom-bar-legend")).toHaveTextContent("MetricA");

		// ReactNode legend slot
		rerender(
			<BarChart
				data={points}
				series={[{ key: "y", label: "MetricA" }]}
				legend={<div data-testid="node-legend">Static Legend Slot</div>}
			/>,
		);
		expect(screen.getByTestId("node-legend")).toHaveTextContent("Static Legend Slot");
	});

	it("renders default ChartLegend when showLegend is true and legend prop is undefined", () => {
		render(<BarChart data={points} series={[{ key: "y", label: "DirectLegend" }]} showLegend />);
		expect(screen.getByTestId("chart-legend")).toHaveTextContent("DirectLegend");
	});

	it("renders actual formatted axis ticks, explicit yDomain bounds, and activates customTooltip", () => {
		const { container } = render(
			<BarChart
				data={points}
				showAxes
				valueFormatter={(v) => `$${v}`}
				xValueFormatter={(x) => `M_${x}`}
				yDomain={[0, 100]}
				customTooltip={({ active, payload, label }) =>
					active ? (
						<div data-testid="bar-custom-tt">
							<span>Label: {label}</span>
							<span>Val: ${payload?.[0]?.value}</span>
						</div>
					) : null
				}
			/>,
		);

		// Grid is rendered
		expect(container.querySelector(".recharts-cartesian-grid")).toBeTruthy();

		// Actual X-axis formatted tick labels M_Jan, M_Feb
		const allText = Array.from(container.querySelectorAll("svg text")).map((t) => t.textContent);
		expect(allText).toContain("M_Jan");
		expect(allText).toContain("M_Feb");

		// Actual Y-axis domain upper limit $100 and lower limit $0
		expect(allText).toContain("$0");
		expect(allText).toContain("$100");

		// Interactive accessibility layer allows ArrowRight keyboard activation of customTooltip
		const surface = container.querySelector("svg.recharts-surface");
		if (!surface) throw new Error("surface missing");
		fireEvent.focus(surface);
		fireEvent.keyDown(surface, { key: "ArrowRight" });

		const tooltip = screen.getByTestId("bar-custom-tt");
		expect(tooltip).toBeInTheDocument();
		expect(tooltip).toHaveTextContent("Label: Feb");
		expect(tooltip).toHaveTextContent("Val: $15");
	});
});
