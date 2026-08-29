import { Line, LineChart as RechartsLine, Tooltip, XAxis, YAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function LineChart({
	data = SAMPLE,
	ariaLabel = "Line chart",
	className,
	showAxes = false,
	color,
	valueFormatter,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	color?: string;
	valueFormatter?: (value: number) => string;
}) {
	const dual = data.some((point) => point.y2 != null);
	const triple = data.some((point) => point.y3 != null);
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsLine data={data}>
				<XAxis dataKey="x" hide={!showAxes} />
				<YAxis hide={!showAxes} />
				{valueFormatter ? <Tooltip formatter={(value) => valueFormatter(Number(value))} /> : null}
				<Line type="monotone" dataKey="y" stroke={color ?? CHART_COLORS[0]} dot={false} />
				{dual ? <Line type="monotone" dataKey="y2" stroke={CHART_COLORS[2]} dot={false} /> : null}
				{triple ? <Line type="monotone" dataKey="y3" stroke={CHART_COLORS[4]} dot={false} /> : null}
			</RechartsLine>
		</ChartFrame>
	);
}
