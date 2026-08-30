import { Line, LineChart as RechartsLine } from "recharts";
import { ANIMATION_PROPS } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function Sparkline({
	data = SAMPLE,
	ariaLabel = "Sparkline",
	className,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className} size="h-10 w-28">
			<RechartsLine data={data}>
				<Line
					type="monotone"
					dataKey="y"
					stroke={CHART_COLORS[0]}
					dot={false}
					{...ANIMATION_PROPS}
				/>
			</RechartsLine>
		</ChartFrame>
	);
}
