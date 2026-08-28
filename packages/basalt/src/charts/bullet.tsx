import { Bar, BarChart as RechartsBar, XAxis } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { BULLET_SAMPLE, type BulletPoint } from "./sample";

export function BulletChart({
	data = BULLET_SAMPLE,
	ariaLabel = "Bullet chart",
	className,
}: {
	data?: BulletPoint[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data} layout="vertical">
				<XAxis type="number" hide />
				<Bar dataKey="target" fill={CHART_COLORS[6]} barSize={10} />
				<Bar dataKey="value" fill={CHART_COLORS[1]} barSize={6} />
			</RechartsBar>
		</ChartFrame>
	);
}
