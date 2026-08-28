import { Area, AreaChart as RechartsArea, XAxis, YAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function AreaChart({
	data = SAMPLE,
	ariaLabel = "Area chart",
	className,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsArea data={data}>
				<XAxis dataKey="x" hide />
				<YAxis hide />
				<Area dataKey="y" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.2} />
			</RechartsArea>
		</ChartFrame>
	);
}
