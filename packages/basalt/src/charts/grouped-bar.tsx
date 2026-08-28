import { Bar, BarChart as RechartsBar, XAxis, YAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SAMPLE, type XYPoint } from "./sample";

export function GroupedBarChart({
	data = SAMPLE,
	ariaLabel = "Grouped bar chart",
	className,
}: {
	data?: XYPoint[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data}>
				<XAxis dataKey="x" hide />
				<YAxis hide />
				<Bar dataKey="y" fill={CHART_COLORS[0]} />
				<Bar dataKey="y2" fill={CHART_COLORS[2]} />
			</RechartsBar>
		</ChartFrame>
	);
}
