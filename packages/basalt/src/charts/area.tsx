import { Area, AreaChart as RechartsArea, XAxis, YAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function AreaChart({
	data = SAMPLE,
	ariaLabel = "Area chart",
	className,
	showAxes = false,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
}) {
	const dual = data.some((point) => point.y2 != null);
	const triple = data.some((point) => point.y3 != null);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsArea data={data}>
				<XAxis dataKey="x" hide={!showAxes} />
				<YAxis hide={!showAxes} />
				<Area dataKey="y" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.2} />
				{dual ? (
					<Area dataKey="y2" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.2} />
				) : null}
				{triple ? (
					<Area dataKey="y3" stroke={CHART_COLORS[4]} fill={CHART_COLORS[4]} fillOpacity={0.2} />
				) : null}
			</RechartsArea>
		</ChartFrame>
	);
}
