import { Bar, CartesianGrid, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	BAR_RADIUS,
	CHART_PLOT_MARGIN,
	CHART_PLOT_MARGIN_BARE,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
	seriesColor,
} from "./config";
import { ChartShell } from "./frame";
import { ChartLegend } from "./legend";
import { resolveChartSeries, type XYPoint, type XYSeriesDescriptor } from "./series";

export type GroupedBarChartProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	showLegend?: boolean;
};

export function GroupedBarChart({
	data,
	series,
	ariaLabel = "Grouped bar chart",
	className,
	showAxes = false,
	showLegend = false,
}: GroupedBarChartProps) {
	const bars = resolveChartSeries(series, ["y", "y2"]);
	return (
		<ChartShell
			ariaLabel={ariaLabel}
			className={className}
			legend={showLegend ? <ChartLegend items={bars} shape="bar" /> : undefined}
		>
			<RechartsBar data={data} margin={showAxes ? CHART_PLOT_MARGIN : CHART_PLOT_MARGIN_BARE}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} />
				<Tooltip {...chartTooltipProps({ cursor: "bar" })} />
				{bars.map((item, index) => (
					<Bar
						key={item.key}
						dataKey={item.key}
						name={item.label ?? item.key}
						fill={seriesColor(item, index)}
						radius={BAR_RADIUS.vertical}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsBar>
		</ChartShell>
	);
}
