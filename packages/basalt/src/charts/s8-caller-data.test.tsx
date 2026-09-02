import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as root from "../index";
import { BarChart } from "./bar";
import { seriesColor } from "./config";
import { DonutChart } from "./donut";
import { Gauge } from "./gauge";
import { ItemList } from "./item-list";
import { LineChart } from "./line";
import { resolveChartSeries } from "./series";
import { StatCard } from "./stat-card";

describe("S8 caller data", () => {
	it("renders series from caller data and not SAMPLE fallbacks", () => {
		const line = [{ x: "Alpha", y: 9 }];
		const share = [{ name: "Atlas", value: 3 }];
		render(<LineChart data={line} ariaLabel={`Line ${line[0]?.x}`} />);
		expect(screen.getByRole("img", { name: "Line Alpha" })).toBeInTheDocument();
		render(
			<LineChart
				data={[{ x: "Alpha", y: 9, y2: 3 }]}
				series={[
					{ key: "y", label: "Main", color: "rgb(1, 2, 3)" },
					{ key: "y2", label: "Alt" },
				]}
				ariaLabel="Named series"
			/>,
		);
		expect(screen.getByRole("img", { name: "Named series" })).toBeInTheDocument();
		render(<BarChart data={[{ x: "Beta", y: 4 }]} ariaLabel="Caller bars" />);
		expect(screen.getByRole("img", { name: "Caller bars" })).toBeInTheDocument();
		render(<DonutChart data={share} ariaLabel={`Share ${share[0]?.name}`} showLegend />);
		expect(screen.getByRole("img", { name: "Share Atlas" })).toBeInTheDocument();
		expect(screen.queryByRole("img", { name: "Line Mon" })).toBeNull();
	});

	it("renders gauge and list summaries from caller values", () => {
		render(<Gauge value={41} ariaLabel="Caller load" />);
		expect(screen.getByRole("img", { name: "Caller load" })).toBeInTheDocument();
		expect(screen.getByText("41")).toBeInTheDocument();
		render(<StatCard label="CPU" value="8%" />);
		expect(screen.getByRole("img", { name: "CPU 8%" })).toBeInTheDocument();
		render(<ItemList items={[{ label: "North", value: "12" }]} ariaLabel="Regions" />);
		expect(screen.getByRole("list", { name: "Regions" })).toHaveTextContent("North 12");
	});

	it("keeps chart kit series colors on the palette and charts off the root barrel", () => {
		expect(seriesColor({ key: "y", color: "rgb(1, 2, 3)" }, 0)).toBe("rgb(1, 2, 3)");
		expect(seriesColor({ key: "y" }, 0)).toContain("--basalt-chart-1");
		expect(resolveChartSeries(undefined, ["y", "y2"])).toEqual([{ key: "y" }, { key: "y2" }]);
		expect(resolveChartSeries([{ key: "y2", color: "rgb(4, 5, 6)" }], ["y"])).toEqual([
			{ key: "y2", color: "rgb(4, 5, 6)" },
		]);
		expect(root).not.toHaveProperty("LineChart");
		expect(root).not.toHaveProperty("DonutChart");
		expect(root).not.toHaveProperty("ChartPalette");
	});
});
