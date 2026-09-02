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

export type StackedBarChartProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	showLegend?: boolean;
};

export function StackedBarChart({
	data,
	series,
	ariaLabel = "Stacked bar chart",
	className,
	showAxes = false,
	showLegend = false,
}: StackedBarChartProps) {
	const bars = resolveChartSeries(series, ["y", "y2", "y3"]);
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
						stackId="stack"
						fill={seriesColor(item, index)}
						radius={BAR_RADIUS.vertical}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsBar>
		</ChartShell>
	);
}
