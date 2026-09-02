import { CartesianGrid, Line, LineChart as RechartsLine, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
	seriesColor,
} from "./config";
import { ChartFrame } from "./frame";
import {
	type ChartSeriesDescriptor,
	resolveChartSeries,
	type XYPoint,
	xyFallbackKeys,
} from "./series";

export type LineChartProps = {
	data: XYPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	color?: string;
	valueFormatter?: (value: number) => string;
};

export function LineChart({
	data,
	series,
	ariaLabel = "Line chart",
	className,
	showAxes = false,
	color,
	valueFormatter,
}: LineChartProps) {
	const lines = resolveChartSeries(series, xyFallbackKeys(data));
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsLine data={data}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "line" })} />
				{lines.map((item, index) => (
					<Line
						key={item.key}
						type="monotone"
						dataKey={item.key}
						name={item.label ?? item.key}
						stroke={index === 0 && color ? color : seriesColor(item, index)}
						dot={false}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsLine>
		</ChartFrame>
	);
}
