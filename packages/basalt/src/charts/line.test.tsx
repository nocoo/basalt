import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { cloneElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { LineChart } from "./line";

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

describe("LineChart", () => {
	const points = [
		{ x: "Mon", y: 4, y2: 8 },
		{ x: "Tue", y: 6, y2: 12 },
	];

	it("renders a chart container", () => {
		const { container } = render(<LineChart data={[{ x: "Mon", y: 4 }]} />);
		expect(container.firstChild).toBeTruthy();
	});

	it("accepts a single series without y2", () => {
		const { container } = render(<LineChart data={[{ x: "Mon", y: 4 }]} ariaLabel="Solo" />);
		expect(container.firstChild).toBeTruthy();
	});

	it("shows axes when requested", () => {
		const { container } = render(
			<LineChart data={[{ x: "Mon", y: 4 }]} ariaLabel="Performance" showAxes />,
		);
		expect(container.querySelector("[aria-label='Performance']")).toBeTruthy();
	});

	it("uses the caller color and formatter", () => {
		const { container } = render(
			<LineChart
				data={[{ x: "Mon", y: 4 }]}
				ariaLabel="Latency"
				color="rgb(1, 2, 3)"
				valueFormatter={(value) => `${value}ms`}
			/>,
		);
		expect(container.querySelector('[aria-label="Latency"]')).toBeTruthy();
	});

	it("supports showLegend default and enabled, custom legend renderer and custom node", () => {
		const { rerender } = render(<LineChart data={points} ariaLabel="Line" />);
		expect(screen.queryByTestId("chart-legend")).toBeNull();

		rerender(<LineChart data={points} ariaLabel="Line" showLegend />);
		expect(screen.getByTestId("chart-legend")).toBeInTheDocument();

		rerender(
			<LineChart
				data={points}
				legend={({ items }) => (
					<div data-testid="custom-line-legend">
						{items.map((it) => (
							<span key={it.key}>{it.key}</span>
						))}
					</div>
				)}
			/>,
		);
		expect(screen.getByTestId("custom-line-legend")).toHaveTextContent("yy2");

		rerender(
			<LineChart
				data={points}
				legend={<div data-testid="line-node-legend">Line Legend Node</div>}
			/>,
		);
		expect(screen.getByTestId("line-node-legend")).toHaveTextContent("Line Legend Node");
	});

	it("renders formatted axes ticks, explicit yDomain bounds, and activates customTooltip with keyboard", () => {
		const { container } = render(
			<LineChart
				data={points}
				showAxes
				valueFormatter={(v) => `${v}ms`}
				xValueFormatter={(x) => `Day_${x}`}
				yDomain={[0, 50]}
				customTooltip={({ active, payload, label }) =>
					active ? (
						<div data-testid="line-custom-tt">
							<span>Period: {label}</span>
							<span>Latency: {payload?.[0]?.value}ms</span>
						</div>
					) : null
				}
			/>,
		);
		expect(container.querySelector(".recharts-cartesian-grid")).toBeTruthy();

		const allText = Array.from(container.querySelectorAll("svg text")).map((t) => t.textContent);
		expect(allText).toContain("Day_Mon");
		expect(allText).toContain("Day_Tue");
		expect(allText).toContain("0ms");
		expect(allText).toContain("50ms");

		const surface = container.querySelector("svg.recharts-surface");
		if (!surface) throw new Error("surface missing");
		fireEvent.focus(surface);
		fireEvent.keyDown(surface, { key: "ArrowRight" });

		const tooltip = screen.getByTestId("line-custom-tt");
		expect(tooltip).toBeInTheDocument();
		expect(tooltip).toHaveTextContent("Period: Tue");
		expect(tooltip).toHaveTextContent("Latency: 6ms");
	});
});
