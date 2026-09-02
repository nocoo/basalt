import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadar } from "recharts";
import { ANIMATION_PROPS, chartTickStyle, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import type { ChartSeriesDescriptor, RadarPoint } from "./series";

export type RadarChartProps = {
	data: RadarPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
};

export function RadarChart({
	data,
	series,
	ariaLabel = "Radar chart",
	className,
}: RadarChartProps) {
	const fill = seriesColor(series?.[0], 3);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsRadar data={data} outerRadius={60}>
				<PolarGrid />
				<PolarAngleAxis dataKey="subject" tick={chartTickStyle()} tickLine={false} />
				<Radar
					dataKey="value"
					name={series?.[0]?.label}
					fill={fill}
					fillOpacity={0.3}
					stroke={fill}
					{...ANIMATION_PROPS}
				/>
			</RechartsRadar>
		</ChartFrame>
	);
}
