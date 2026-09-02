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
import { ChartFrame } from "./frame";
import { resolveChartSeries, type XYPoint, type XYSeriesDescriptor } from "./series";

export type GroupedBarChartProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
};

export function GroupedBarChart({
	data,
	series,
	ariaLabel = "Grouped bar chart",
	className,
	showAxes = false,
}: GroupedBarChartProps) {
	const bars = resolveChartSeries(series, ["y", "y2"]);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
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
		</ChartFrame>
	);
}
