import { Bar, BarChart as RechartsBar, XAxis, YAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function BarChart({
	data = SAMPLE,
	ariaLabel = "Bar chart",
	className,
	showAxes = false,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data}>
				<XAxis dataKey="x" hide={!showAxes} />
				<YAxis hide={!showAxes} />
				<Bar dataKey="y" fill={CHART_COLORS[0]} />
			</RechartsBar>
		</ChartFrame>
	);
}
