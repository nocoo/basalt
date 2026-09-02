import { describe, expect, it } from "vitest";
import { AreaChart } from "./area";
import { BarChart } from "./bar";
import { Colors } from "./chart-colors";
import { Charts } from "./charts";
import { CustomChart } from "./custom-chart";
import { DonutChart } from "./donut";
import { Gauge } from "./gauge";
import { HeatmapCalendar } from "./heatmap-calendar";
import { ItemList } from "./item-list";
import { ChartLegend } from "./legend";
import { LineChart } from "./line";
import { ChartPalette } from "./palette";
import { Sparkline } from "./sparkline";
import { StatCard } from "./stat-card";
import { Timeseries } from "./timeseries";

describe("chart exports", () => {
	it("exposes independently importable chart components", () => {
		expect(LineChart).toBeTypeOf("function");
		expect(ChartLegend).toBeTypeOf("function");
		expect(BarChart).toBeTypeOf("function");
		expect(AreaChart).toBeTypeOf("function");
		expect(DonutChart).toBeTypeOf("function");
		expect(Sparkline).toBeTypeOf("function");
		expect(Gauge).toBeTypeOf("function");
		expect(StatCard).toBeTypeOf("function");
		expect(ChartPalette).toBeTypeOf("function");
		expect(HeatmapCalendar).toBeTypeOf("function");
		expect(ItemList).toBeTypeOf("function");
		expect(Charts).toBeTypeOf("function");
		expect(Colors).toBeTypeOf("function");
		expect(Timeseries).toBeTypeOf("function");
		expect(CustomChart).toBeTypeOf("function");
	});
});
