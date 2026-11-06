import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BulletChart } from "./bullet";

type XAxisProps = {
	tickFormatter?: (value: number) => string;
};

type YAxisProps = {
	width?: number | string;
	dataKey?: string;
	hide?: boolean;
	tickMargin?: number;
	interval?: number | string;
};

type BarProps = {
	dataKey: string;
	fill?: string;
	barSize?: number;
	name?: string;
};

vi.mock("recharts", () => ({
	ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	BarChart: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	XAxis: ({ tickFormatter }: XAxisProps) => (
		<div data-testid="x-axis" data-format={tickFormatter ? tickFormatter(68) : ""} />
	),
	YAxis: ({ width, dataKey, hide, tickMargin, interval }: YAxisProps) => (
		<div
			data-testid="y-axis"
			data-width={width}
			data-key={dataKey}
			data-hidden={hide}
			data-tick-margin={tickMargin}
			data-interval={interval}
		/>
	),
	Tooltip: () => null,
	Bar: ({ dataKey, fill, barSize, name }: BarProps) => (
		<div data-testid={`bar-${dataKey}`} data-fill={fill} data-size={barSize} data-name={name} />
	),
}));

const kpis = [
	{ name: "Care adherence", value: 68, target: 80 },
	{ name: "Follow-up completion", value: 72, target: 85 },
	{ name: "Plan participation", value: 58, target: 70 },
];

describe("BulletChart", () => {
	it("delegates category width to Recharts auto sizing instead of a char heuristic", () => {
		render(<BulletChart data={kpis} ariaLabel="Bullet KPIs" />);
		const axis = screen.getByTestId("y-axis");
		expect(axis.dataset.width).toBe("auto");
		expect(axis.dataset.key).toBe("name");
		expect(Number(axis.dataset.tickMargin)).toBeGreaterThan(0);
		expect(axis.dataset.interval).toBeUndefined();
	});

	it("gives value and target distinct fills instead of colliding in the palette cycle", () => {
		render(<BulletChart data={kpis} ariaLabel="Bullet KPIs" />);
		const value = screen.getByTestId("bar-value");
		const target = screen.getByTestId("bar-target");
		expect(value.dataset.fill).toBeTruthy();
		expect(target.dataset.fill).toBeTruthy();
		expect(value.dataset.fill).not.toBe(target.dataset.fill);
		expect(value.dataset.fill).toContain("--basalt-chart-1");
		expect(target.dataset.fill).toContain("--basalt-chart-7");
		expect(Number(value.dataset.size)).toBeGreaterThan(Number(target.dataset.size));
	});

	it("keeps caller colors and labels for both series", () => {
		render(
			<BulletChart
				data={kpis}
				ariaLabel="Explicit bullet"
				series={[
					{ key: "value", label: "Actual", color: "rgb(1, 2, 3)" },
					{ key: "target", label: "Goal", color: "rgb(4, 5, 6)" },
				]}
			/>,
		);
		const value = screen.getByTestId("bar-value");
		const target = screen.getByTestId("bar-target");
		expect(value.dataset.fill).toBe("rgb(1, 2, 3)");
		expect(target.dataset.fill).toBe("rgb(4, 5, 6)");
		expect(value.dataset.name).toBe("Actual");
		expect(target.dataset.name).toBe("Goal");
	});

	it("forwards the value formatter to the value axis", () => {
		render(
			<BulletChart
				data={kpis}
				ariaLabel="Formatted bullet"
				valueFormatter={(value) => `${value} points`}
			/>,
		);
		expect(screen.getByTestId("x-axis").dataset.format).toBe("68 points");
	});

	it("links the summary to the chart and hides the axis on request", () => {
		render(
			<BulletChart
				data={kpis}
				ariaLabel="Summarized bullet"
				summary="Care adherence 68 of 80"
				showAxes={false}
			/>,
		);
		const chart = screen.getByRole("group", { name: "Summarized bullet" });
		const descriptionId = chart.getAttribute("aria-describedby");
		expect(descriptionId).toBeTruthy();
		expect(document.getElementById(descriptionId as string)).toHaveTextContent(
			"Care adherence 68 of 80",
		);
		expect(screen.getByTestId("y-axis").dataset.hidden).toBe("true");
	});
});
