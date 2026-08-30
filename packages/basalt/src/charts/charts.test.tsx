import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AreaChart } from "./area";
import { BarChart } from "./bar";
import { BulletChart } from "./bullet";
import { Colors } from "./chart-colors";
import { Charts } from "./charts";
import { CustomChart } from "./custom-chart";
import { DateNavigation } from "./date-navigation";
import { DonutChart } from "./donut";
import { FunnelChart } from "./funnel";
import { Gauge } from "./gauge";
import { GroupedBarChart } from "./grouped-bar";
import { HeatmapCalendar } from "./heatmap-calendar";
import { ItemList } from "./item-list";
import { LineChart } from "./line";
import { CHART_COLORS, ChartPalette } from "./palette";
import { RadarChart } from "./radar";
import { SankeyChart } from "./sankey";
import { SlotBarChart } from "./slot-bar";
import { Sparkline } from "./sparkline";
import { StackedBarChart } from "./stacked-bar";
import { StatCard } from "./stat-card";
import { Timeline } from "./timeline";
import { Timeseries } from "./timeseries";

const points = [{ x: "Mon", y: 4, y2: 2 }];

describe("charts", () => {
	it("keeps the 24-color palette", () => {
		expect(CHART_COLORS).toHaveLength(24);
		expect(CHART_COLORS[0]).toContain("--basalt-chart-1");
		render(<ChartPalette />);
		expect(screen.getByRole("img", { name: "Chart colors" })).toBeInTheDocument();
	});

	it("accepts caller data and accessible names", () => {
		render(<LineChart data={points} ariaLabel="Requests" />);
		expect(screen.getByRole("img", { name: "Requests" })).toBeInTheDocument();
		render(<BarChart data={points} ariaLabel="Bars" />);
		expect(screen.getByRole("img", { name: "Bars" })).toBeInTheDocument();
		render(<AreaChart data={points} ariaLabel="Area" />);
		expect(screen.getByRole("img", { name: "Area" })).toBeInTheDocument();
		render(
			<AreaChart data={[{ x: "Mon", y: 4, y2: 2, y3: 1 }]} ariaLabel="Stacked area" stacked />,
		);
		expect(screen.getByRole("img", { name: "Stacked area" })).toBeInTheDocument();
		render(<DonutChart data={[{ name: "A", value: 1 }]} ariaLabel="Share" />);
		expect(screen.getByRole("img", { name: "Share" })).toBeInTheDocument();
		render(<DonutChart data={[{ name: "A", value: 1 }]} ariaLabel="Legend donut" showLegend />);
		expect(screen.getByRole("img", { name: "Legend donut" })).toBeInTheDocument();
		const { container: donutDup } = render(
			<DonutChart
				data={[
					{ name: "A", value: 1 },
					{ name: "A", value: 2 },
				]}
				ariaLabel="Dup"
			/>,
		);
		expect(screen.getByRole("img", { name: "Dup" })).toBeInTheDocument();
		expect(donutDup.querySelector('[role="application"]')).toBeNull();
		render(<RadarChart data={[{ subject: "Speed", value: 10 }]} ariaLabel="Radar" />);
		expect(screen.getByRole("img", { name: "Radar" })).toBeInTheDocument();
		render(<FunnelChart data={[{ name: "In", value: 10 }]} ariaLabel="Funnel" />);
		expect(screen.getByRole("img", { name: "Funnel" })).toBeInTheDocument();
		render(<BulletChart data={[{ name: "KPI", value: 4, target: 8 }]} ariaLabel="Bullet" />);
		expect(screen.getByRole("img", { name: "Bullet" })).toBeInTheDocument();
		render(<GroupedBarChart data={points} ariaLabel="Grouped" />);
		expect(screen.getByRole("img", { name: "Grouped" })).toBeInTheDocument();
		render(<StackedBarChart data={points} ariaLabel="Stacked" />);
		expect(screen.getByRole("img", { name: "Stacked" })).toBeInTheDocument();
		render(<Sparkline data={points} ariaLabel="Spark" />);
		expect(screen.getByRole("img", { name: "Spark" })).toBeInTheDocument();
		render(<SlotBarChart data={points} ariaLabel="Slots" />);
		expect(screen.getByRole("img", { name: "Slots" })).toBeInTheDocument();
		render(<SankeyChart ariaLabel="Flow" />);
		expect(screen.getByRole("img", { name: "Flow" })).toBeInTheDocument();
		render(<Charts data={points} ariaLabel="Overview" />);
		expect(screen.getByRole("img", { name: "Overview" })).toBeInTheDocument();
		render(<Timeseries data={points} ariaLabel="Series" />);
		expect(screen.getByRole("img", { name: "Series" })).toBeInTheDocument();
		render(<CustomChart data={points} ariaLabel="Custom" />);
		expect(screen.getByRole("img", { name: "Custom" })).toBeInTheDocument();
		render(<Colors />);
		render(<HeatmapCalendar values={[1, 2, 3]} ariaLabel="Heat" />);
		expect(screen.getByRole("img", { name: "Heat" })).toBeInTheDocument();
		render(
			<HeatmapCalendar
				data={[{ date: "2026-01-01", value: 4 }]}
				year={2026}
				ariaLabel="Year heat"
				metricLabel="Sessions"
			/>,
		);
		expect(screen.getByRole("img", { name: "Year heat" })).toBeInTheDocument();
		expect(screen.getByText("Less")).toBeInTheDocument();
		render(<ItemList items={[{ label: "A", value: "1" }]} ariaLabel="Items" />);
		expect(screen.getByRole("list", { name: "Items" })).toHaveTextContent("A 1");
		render(
			<ItemList
				items={[
					{ label: "Deployed", value: "Mon" },
					{ label: "Deployed", value: "Tue" },
					{ id: "c", label: "Deployed", value: "Wed" },
				]}
				ariaLabel="Duplicates"
			/>,
		);
		expect(screen.getByRole("list", { name: "Duplicates" }).querySelectorAll("li")).toHaveLength(3);
		render(
			<Timeline
				items={[
					{ title: "Deployed", at: "Mon" },
					{ title: "Deployed", at: "Tue" },
				]}
				ariaLabel="Events"
			/>,
		);
		expect(screen.getByRole("list", { name: "Events" }).querySelectorAll("li")).toHaveLength(2);
		render(<StatCard label="CPU" value="8%" />);
		expect(screen.getByRole("img", { name: "CPU 8%" })).toBeInTheDocument();
		render(<Gauge value={20} ariaLabel="Load" />);
		expect(screen.getByRole("img", { name: "Load" })).toBeInTheDocument();
		expect(screen.getByText("20")).toBeInTheDocument();
		render(<Gauge value={742} max={850} ariaLabel="Score" />);
		expect(screen.getByText("742")).toBeInTheDocument();
		render(<Gauge value={68} valueFormatter={(next) => `${next}%`} ariaLabel="Saved" />);
		expect(screen.getByText("68%")).toBeInTheDocument();
		render(<Gauge value={40} ariaLabel="Quiet" hideValue />);
		expect(screen.getByRole("img", { name: "Quiet" })).toBeInTheDocument();
		expect(screen.queryByText("40")).toBeNull();
		render(<DateNavigation ariaLabel="When" />);
		expect(screen.getByRole("button", { name: "When" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Previous day" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Next day" })).toBeInTheDocument();
		render(
			<DateNavigation
				selectedDate={new Date(2026, 1, 13)}
				onPrevDay={() => {}}
				onNextDay={() => {}}
				onToday={() => {}}
				todayLabel="Today"
			/>,
		);
		expect(screen.getByText("Today")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /2026/ })).toBeNull();
		render(
			<Timeline
				events={[{ id: "i1", time: "08:45", title: "Packet loss", subtitle: "0.6%" }]}
				ariaLabel="Incidents"
			/>,
		);
		expect(screen.getByText("Packet loss")).toBeInTheDocument();
		expect(screen.getByText("08:45")).toBeInTheDocument();
	});
});
