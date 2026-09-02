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

export type BarChartProps = {
	data: XYPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	color?: string;
	valueFormatter?: (value: number) => string;
};

export function BarChart({
	data,
	series,
	ariaLabel = "Bar chart",
	className,
	showAxes = false,
	color,
	valueFormatter,
}: BarChartProps) {
	const bars = resolveChartSeries(series, ["y"]);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "bar" })} />
				{bars.map((item, index) => (
					<Bar
						key={item.key}
						dataKey={item.key}
						name={item.label ?? item.key}
						fill={index === 0 && color ? color : seriesColor(item, index)}
						radius={BAR_RADIUS.vertical}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsBar>
		</ChartFrame>
	);
}
