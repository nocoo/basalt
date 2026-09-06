import { render, screen } from "@testing-library/react";
import type React from "react";
import { cloneElement } from "react";
import { Bar, BarChart as RechartsBar } from "recharts";
import { describe, expect, it, vi } from "vitest";
import { BarChart } from "./bar";
import { ChartFrame, ChartShell } from "./frame";
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
						width: 300,
						height: 180,
					})}
				</div>
			);
		},
	};
});

describe("ChartFrame behavior", () => {
	const points = [{ x: "Mon", y: 4 }];

	it("defaults accessibilityLayer=true on child Recharts with role application, tabindex, and aria-label", () => {
		const { container } = render(<BarChart data={points} ariaLabel="Default accessible bar" />);
		const svg = container.querySelector("svg.recharts-surface");
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveAttribute("role", "application");
		expect(svg).toHaveAttribute("tabindex", "0");
		expect(svg).toHaveAttribute("aria-label", "Default accessible bar");
	});

	it("disables interactive role on child svg when parent accessibilityLayer={false}", () => {
		const { container } = render(
			<BarChart data={points} ariaLabel="Static bar" accessibilityLayer={false} />,
		);
		const svg = container.querySelector("svg.recharts-surface");
		expect(svg).toBeInTheDocument();
		expect(svg?.getAttribute("role")).toBeNull();
		expect(svg?.getAttribute("tabindex")).toBeNull();
		expect(svg).toHaveAttribute("aria-label", "Static bar");
	});

	it("respects child explicit accessibilityLayer={false} even if ChartFrame accessibilityLayer defaults to true", () => {
		const { container } = render(
			<ChartFrame ariaLabel="Explicit child false">
				<RechartsBar data={points} accessibilityLayer={false}>
					<Bar dataKey="y" />
				</RechartsBar>
			</ChartFrame>,
		);
		const svg = container.querySelector("svg.recharts-surface");
		expect(svg).toBeInTheDocument();
		expect(svg?.getAttribute("role")).toBeNull();
		expect(svg?.getAttribute("tabindex")).toBeNull();
	});

	it("associates summary with useId and places dataAlternative outside plot area", () => {
		const { container } = render(
			<LineChart
				data={points}
				ariaLabel="Trend Line"
				summary="Requests rose by 25% this week."
				dataAlternative={
					<table data-testid="alt-table">
						<tbody>
							<tr>
								<td>Mon</td>
								<td>4</td>
							</tr>
						</tbody>
					</table>
				}
			/>,
		);
		const group = screen.getByRole("group", { name: "Trend Line" });
		expect(group).toBeInTheDocument();

		const summaryNode = screen.getByText("Requests rose by 25% this week.");
		const generatedId = summaryNode.getAttribute("id");
		expect(generatedId).toBeTruthy();
		expect(group).toHaveAttribute("aria-describedby", generatedId);

		const svg = container.querySelector("svg.recharts-surface");
		expect(svg).toHaveAttribute("aria-describedby", generatedId);
		expect(screen.getByTestId("alt-table")).toBeInTheDocument();
	});

	it("does not drop slot value 0 for summary and dataAlternative", () => {
		render(
			<ChartShell ariaLabel="Zero slots" summary={0} dataAlternative={0}>
				<RechartsBar data={points}>
					<Bar dataKey="y" />
				</RechartsBar>
			</ChartShell>,
		);
		const zeroes = screen.getAllByText("0");
		expect(zeroes.length).toBeGreaterThanOrEqual(2);
	});
});
