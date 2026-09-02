import { Bar, CartesianGrid, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	BAR_RADIUS,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
	seriesColor,
} from "./config";
import { ChartFrame } from "./frame";
import { type ChartSeriesDescriptor, resolveChartSeries, type XYPoint } from "./series";

export type StackedBarChartProps = {
	data: XYPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
};

export function StackedBarChart({
	data,
	series,
	ariaLabel = "Stacked bar chart",
	className,
	showAxes = false,
}: StackedBarChartProps) {
	const bars = resolveChartSeries(series, ["y", "y2", "y3"]);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data}>
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
		</ChartFrame>
	);
}
