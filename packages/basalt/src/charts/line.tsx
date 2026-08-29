import { Line, LineChart as RechartsLine, XAxis, YAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function LineChart({
	data = SAMPLE,
	ariaLabel = "Line chart",
	className,
	showAxes = false,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
}) {
	const dual = data.some((point) => point.y2 != null);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsLine data={data}>
				<XAxis dataKey="x" hide={!showAxes} />
				<YAxis hide={!showAxes} />
				<Line type="monotone" dataKey="y" stroke={CHART_COLORS[0]} dot={false} />
				{dual ? <Line type="monotone" dataKey="y2" stroke={CHART_COLORS[2]} dot={false} /> : null}
			</RechartsLine>
		</ChartFrame>
	);
}
