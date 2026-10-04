import { render, screen } from "@testing-library/react";
import { cloneElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { Sparkline } from "./sparkline";

vi.mock("recharts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("recharts")>();
	return {
		...actual,
		ResponsiveContainer: ({
			children,
		}: {
			children: ReactElement<{ width?: number; height?: number }>;
		}) => cloneElement(children, { width: 112, height: 20 }),
	};
});

describe("Sparkline", () => {
	it("renders compact two-tone green bars instead of a line", () => {
		const { container } = render(
			<Sparkline
				data={[
					{ x: 0, y: 4 },
					{ x: 1, y: 10 },
					{ x: 2, y: 7 },
				]}
			/>,
		);
		const bars = container.querySelectorAll(".recharts-rectangle");
		expect(bars).toHaveLength(3);
		expect(bars[0]).toHaveAttribute("fill-opacity", "0.4");
		expect(bars[1]).toHaveAttribute("fill-opacity", "1");
		expect(bars[0]).toHaveAttribute("fill", "hsl(var(--basalt-chart-5))");
		expect(container.querySelector(".recharts-line")).toBeNull();
		expect(container.querySelector(".basalt-chart")).toHaveClass("h-basalt-5", "w-basalt-28");
	});

	it("preserves custom series, colors, summaries and data alternatives", () => {
		const { container } = render(
			<Sparkline
				data={[
					{ x: "Mon", requests: 4, errors: 2 },
					{ x: "Tue", requests: 8, errors: 1 },
				]}
				series={[{ key: "requests", label: "Requests", color: "red" }, { key: "errors" }]}
				ariaLabel="Traffic"
				summary="Requests doubled."
				dataAlternative={<p>Mon: 4 requests; Tue: 8 requests.</p>}
				accessibilityLayer={false}
			/>,
		);
		expect(screen.getByRole("group", { name: "Traffic" })).toHaveAccessibleDescription(
			"Requests doubled.",
		);
		expect(screen.getByText("Mon: 4 requests; Tue: 8 requests.")).toBeInTheDocument();
		const series = container.querySelectorAll(".recharts-bar");
		expect(series).toHaveLength(2);
		expect(series[0]?.querySelector(".recharts-rectangle")).toHaveAttribute("fill", "red");
		expect(series[1]?.querySelector(".recharts-rectangle")).toHaveAttribute(
			"fill",
			"hsl(var(--basalt-chart-11))",
		);
	});

	it("keeps missing values as gaps and renders negative values without invalid geometry", () => {
		const { container, rerender } = render(
			<Sparkline
				data={[
					{ x: 0, y: 0 },
					{ x: 1, y: null },
					{ x: 2, y: -4 },
					{ x: 3, y: 8 },
				]}
			/>,
		);
		for (const path of container.querySelectorAll("path")) {
			expect(path.getAttribute("d")).not.toMatch(/NaN|Infinity/);
		}
		expect(container.querySelectorAll(".recharts-rectangle")).toHaveLength(2);
		rerender(<Sparkline data={[]} ariaLabel="Empty trend" />);
		expect(screen.getByRole("group", { name: "Empty trend" })).toBeInTheDocument();
		expect(container.querySelectorAll(".recharts-rectangle")).toHaveLength(0);
	});
});
