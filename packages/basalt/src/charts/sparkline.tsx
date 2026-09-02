import { Line, LineChart as RechartsLine } from "recharts";
import { ANIMATION_PROPS, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import { type ChartSeriesDescriptor, resolveChartSeries, type XYPoint } from "./series";

export type SparklineProps = {
	data: XYPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
};

export function Sparkline({ data, series, ariaLabel = "Sparkline", className }: SparklineProps) {
	const lines = resolveChartSeries(series, ["y"]);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className} size="h-10 w-28">
			<RechartsLine data={data}>
				{lines.map((item, index) => (
					<Line
						key={item.key}
						type="monotone"
						dataKey={item.key}
						name={item.label ?? item.key}
						stroke={seriesColor(item, index)}
						dot={false}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsLine>
		</ChartFrame>
	);
}
