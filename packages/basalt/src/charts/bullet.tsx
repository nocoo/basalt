import { Bar, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import { ANIMATION_PROPS, cartesianAxisProps, chartTooltipProps } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { BULLET_SAMPLE, type BulletPoint } from "./sample";

export function BulletChart({
	data = BULLET_SAMPLE,
	ariaLabel = "Bullet chart",
	className,
	showAxes = true,
	valueFormatter,
}: {
	data?: BulletPoint[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	valueFormatter?: (value: number) => string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsBar data={data} layout="vertical">
				<XAxis type="number" {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<YAxis type="category" dataKey="name" {...cartesianAxisProps(!showAxes)} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "bar" })} />
				<Bar dataKey="target" fill={CHART_COLORS[6]} barSize={10} {...ANIMATION_PROPS} />
				<Bar dataKey="value" fill={CHART_COLORS[1]} barSize={6} {...ANIMATION_PROPS} />
			</RechartsBar>
		</ChartFrame>
	);
}
