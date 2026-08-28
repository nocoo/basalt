import { Funnel, FunnelChart as RechartsFunnel } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { FUNNEL_SAMPLE, type NamedValue } from "./sample";

export function FunnelChart({
	data = FUNNEL_SAMPLE,
	ariaLabel = "Funnel chart",
	className,
}: {
	data?: NamedValue[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsFunnel>
				<Funnel data={data} dataKey="value" nameKey="name" fill={CHART_COLORS[1]} />
			</RechartsFunnel>
		</ChartFrame>
	);
}
