import { Bar, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function BarChart({
	data = SAMPLE,
	ariaLabel = "Bar chart",
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
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data}>
				<XAxis dataKey="x" hide={!showAxes} />
				<YAxis hide={!showAxes} />
				{valueFormatter ? <Tooltip formatter={(value) => valueFormatter(Number(value))} /> : null}
				<Bar dataKey="y" fill={color ?? CHART_COLORS[0]} />
			</RechartsBar>
		</ChartFrame>
	);
}
