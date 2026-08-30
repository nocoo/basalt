import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadar } from "recharts";
import { ANIMATION_PROPS, chartTickStyle } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { RADAR_SAMPLE, type RadarPoint } from "./sample";

export function RadarChart({
	data = RADAR_SAMPLE,
	ariaLabel = "Radar chart",
	className,
}: {
	data?: RadarPoint[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsRadar data={data} outerRadius={60}>
				<PolarGrid />
				<PolarAngleAxis dataKey="subject" tick={chartTickStyle()} tickLine={false} />
				<Radar
					dataKey="value"
					fill={CHART_COLORS[3]}
					fillOpacity={0.3}
					stroke={CHART_COLORS[3]}
					{...ANIMATION_PROPS}
				/>
			</RechartsRadar>
		</ChartFrame>
	);
}
