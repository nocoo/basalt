import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BulletChartCard } from "@/components/dashboard/BulletChartCard";

vi.mock("recharts", () => ({
	ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	BarChart: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	XAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => (
		<div data-testid="x-axis" data-format={tickFormatter ? tickFormatter(68) : ""} />
	),
	YAxis: () => null,
	Tooltip: () => null,
	Bar: () => null,
}));

describe("BulletChartCard", () => {
	it("owns plot height with a fixed size instead of a circular flex/percentage chain", () => {
		const { container } = render(<BulletChartCard />);
		const plot = container.querySelector(".basalt-chart");
		expect(plot).not.toBeNull();
		expect(plot).toHaveClass("h-56", "min-w-72");
		expect(plot).not.toHaveClass("h-full", "flex-1");

		const body = plot?.closest('[data-slot="card-body"]');
		expect(body?.className ?? "").not.toMatch(/\b(flex-1|h-full)\b/);
		expect(screen.getByRole("region", { name: "Bullet KPIs" })).toHaveAttribute("tabindex", "0");
		expect(body).toHaveClass("overflow-x-auto", "basalt-focus-inset");
	});

	it("describes each KPI value against its target", () => {
		render(<BulletChartCard />);
		expect(
			screen.getByText(
				"Care adherence: 68%, Target 80% · Follow-up completion: 72%, Target 85% · Plan participation: 58%, Target 70%",
			),
		).toBeInTheDocument();
	});

	it("formats KPI values as percentages", () => {
		render(<BulletChartCard />);
		expect(screen.getByTestId("x-axis")).toHaveAttribute("data-format", "68%");
	});
});
