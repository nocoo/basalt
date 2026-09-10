import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { cloneElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { AreaChart } from "./area";
import { GroupedBarChart } from "./grouped-bar";
import { StackedBarChart } from "./stacked-bar";

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

describe("GroupedBarChart, StackedBarChart, and AreaChart options", () => {
	const points = [
		{ x: "Q1", y: 10, y2: 20, y3: 30 },
		{ x: "Q2", y: 15, y2: 25, y3: 35 },
	];

	describe("GroupedBarChart", () => {
		it("renders with default showLegend=false and supports showLegend=true", () => {
			const { rerender } = render(<GroupedBarChart data={points} ariaLabel="Grouped" />);
			expect(screen.queryByTestId("chart-legend")).toBeNull();

			rerender(<GroupedBarChart data={points} ariaLabel="Grouped" showLegend />);
			expect(screen.getByTestId("chart-legend")).toBeInTheDocument();
		});

		it("supports custom legend renderer and custom legend node", () => {
			const { rerender } = render(
				<GroupedBarChart
					data={points}
					legend={({ items }) => (
						<div data-testid="custom-grouped-legend">
							{items.map((it) => (
								<span key={it.key}>{it.key}</span>
							))}
						</div>
					)}
				/>,
			);
			expect(screen.getByTestId("custom-grouped-legend")).toHaveTextContent("yy2");

			rerender(
				<GroupedBarChart
					data={points}
					legend={<div data-testid="grouped-node-legend">Grouped Legend</div>}
				/>,
			);
			expect(screen.getByTestId("grouped-node-legend")).toHaveTextContent("Grouped Legend");
		});

		it("falls back to default series and ignores spread color prop", () => {
			render(
				<GroupedBarChart
					data={points}
					series={[]}
					{...({ color: "#ff0000" } as Record<string, unknown>)}
					legend={({ items }) => (
						<div data-testid="grouped-fallback-legend">
							{items.map((it) => (
								<span key={it.key} data-color={it.color ?? "none"}>
									{it.key}
								</span>
							))}
						</div>
					)}
				/>,
			);
			const legend = screen.getByTestId("grouped-fallback-legend");
			expect(legend).toHaveTextContent("yy2");
			// Neither series descriptor should have acquired the spread lead color
			const spans = legend.querySelectorAll("span");
			expect(spans[0]?.getAttribute("data-color")).toBe("none");
			expect(spans[1]?.getAttribute("data-color")).toBe("none");
		});

		it("renders formatted axes ticks, explicit yDomain bounds, and activates customTooltip", () => {
			const { container } = render(
				<GroupedBarChart
					data={points}
					showAxes
					valueFormatter={(v) => `${v}%`}
					xValueFormatter={(x) => `G_${x}`}
					yDomain={[0, 50]}
					customTooltip={({ active, payload, label }) =>
						active ? (
							<div data-testid="grouped-custom-tt">
								<span>Period: {label}</span>
								<span>P1: {payload?.[0]?.value}%</span>
							</div>
						) : null
					}
				/>,
			);
			expect(container.querySelector(".recharts-cartesian-grid")).toBeTruthy();

			const allText = Array.from(container.querySelectorAll("svg text")).map((t) => t.textContent);
			expect(allText).toContain("G_Q1");
			expect(allText).toContain("G_Q2");
			expect(allText).toContain("0%");
			expect(allText).toContain("50%");

			const surface = container.querySelector("svg.recharts-surface");
			if (!surface) throw new Error("surface missing");
			fireEvent.focus(surface);
			fireEvent.keyDown(surface, { key: "ArrowRight" });

			const tooltip = screen.getByTestId("grouped-custom-tt");
			expect(tooltip).toBeInTheDocument();
			expect(tooltip).toHaveTextContent("Period: Q2");
			expect(tooltip).toHaveTextContent("P1: 15%");
		});
	});

	describe("StackedBarChart", () => {
		it("renders with default showLegend=false and supports showLegend=true", () => {
			const { rerender } = render(<StackedBarChart data={points} ariaLabel="Stacked" />);
			expect(screen.queryByTestId("chart-legend")).toBeNull();

			rerender(<StackedBarChart data={points} ariaLabel="Stacked" showLegend />);
			expect(screen.getByTestId("chart-legend")).toBeInTheDocument();
		});

		it("supports custom legend renderer and custom legend node", () => {
			const { rerender } = render(
				<StackedBarChart
					data={points}
					legend={({ items }) => (
						<div data-testid="custom-stacked-legend">
							{items.map((it) => (
								<span key={it.key}>{it.key}</span>
							))}
						</div>
					)}
				/>,
			);
			expect(screen.getByTestId("custom-stacked-legend")).toHaveTextContent("yy2y3");

			rerender(
				<StackedBarChart
					data={points}
					legend={<div data-testid="stacked-node-legend">Stacked Legend</div>}
				/>,
			);
			expect(screen.getByTestId("stacked-node-legend")).toHaveTextContent("Stacked Legend");
		});

		it("renders formatted axes ticks, explicit yDomain bounds, and activates customTooltip without stack offset", () => {
			const { container } = render(
				<StackedBarChart
					data={points}
					showAxes
					valueFormatter={(v) => `${v}%`}
					xValueFormatter={(x) => `S_${x}`}
					yDomain={[0, 100]}
					customTooltip={({ active, payload, label }) =>
						active ? (
							<div data-testid="stacked-custom-tt">
								<span>Quarter: {label}</span>
								<span>Value: {payload?.[0]?.value}</span>
							</div>
						) : null
					}
				/>,
			);
			expect(container.querySelector(".recharts-cartesian-grid")).toBeTruthy();

			const allText = Array.from(container.querySelectorAll("svg text")).map((t) => t.textContent);
			expect(allText).toContain("S_Q1");
			expect(allText).toContain("S_Q2");
			expect(allText).toContain("0%");
			expect(allText).toContain("100%");

			const surface = container.querySelector("svg.recharts-surface");
			if (!surface) throw new Error("surface missing");
			fireEvent.focus(surface);
			fireEvent.keyDown(surface, { key: "ArrowRight" });

			const tooltip = screen.getByTestId("stacked-custom-tt");
			expect(tooltip).toBeInTheDocument();
			expect(tooltip).toHaveTextContent("Quarter: Q2");
			expect(tooltip).toHaveTextContent("Value: 15");
		});
	});

	describe("AreaChart", () => {
		it("renders with default showLegend=false and supports showLegend=true", () => {
			const { rerender } = render(<AreaChart data={points} ariaLabel="Area" />);
			expect(screen.queryByTestId("chart-legend")).toBeNull();

			rerender(<AreaChart data={points} ariaLabel="Area" showLegend />);
			expect(screen.getByTestId("chart-legend")).toBeInTheDocument();
		});

		it("supports custom legend renderer and custom legend node", () => {
			const { rerender } = render(
				<AreaChart
					data={points}
					legend={({ items }) => (
						<div data-testid="custom-area-legend">
							{items.map((it) => (
								<span key={it.key}>{it.key}</span>
							))}
						</div>
					)}
				/>,
			);
			expect(screen.getByTestId("custom-area-legend")).toHaveTextContent("yy2y3");

			rerender(
				<AreaChart data={points} legend={<div data-testid="area-node-legend">Area Legend</div>} />,
			);
			expect(screen.getByTestId("area-node-legend")).toHaveTextContent("Area Legend");
		});

		it("renders formatted axes ticks, explicit yDomain bounds, and activates customTooltip without stack offset", () => {
			const { container } = render(
				<AreaChart
					data={points}
					showAxes
					valueFormatter={(v) => `${v}%`}
					xValueFormatter={(x) => `A_${x}`}
					yDomain={[0, 100]}
					customTooltip={({ active, payload, label }) =>
						active ? (
							<div data-testid="area-custom-tt">
								<span>Time: {label}</span>
								<span>Rate: {payload?.[0]?.value}</span>
							</div>
						) : null
					}
				/>,
			);
			expect(container.querySelector(".recharts-cartesian-grid")).toBeTruthy();

			const allText = Array.from(container.querySelectorAll("svg text")).map((t) => t.textContent);
			expect(allText).toContain("A_Q1");
			expect(allText).toContain("A_Q2");
			expect(allText).toContain("0%");
			expect(allText).toContain("100%");

			const surface = container.querySelector("svg.recharts-surface");
			if (!surface) throw new Error("surface missing");
			fireEvent.focus(surface);
			fireEvent.keyDown(surface, { key: "ArrowRight" });

			const tooltip = screen.getByTestId("area-custom-tt");
			expect(tooltip).toBeInTheDocument();
			expect(tooltip).toHaveTextContent("Time: Q2");
			expect(tooltip).toHaveTextContent("Rate: 15");
		});
	});
});
