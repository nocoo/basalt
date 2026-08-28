import { Line, LineChart as RechartsLine, XAxis, YAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function LineChart({
	data = SAMPLE,
	ariaLabel = "Line chart",
	className,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsLine data={data}>
				<XAxis dataKey="x" hide />
				<YAxis hide />
				<Line type="monotone" dataKey="y" stroke={CHART_COLORS[0]} dot={false} />
			</RechartsLine>
		</ChartFrame>
	);
}
