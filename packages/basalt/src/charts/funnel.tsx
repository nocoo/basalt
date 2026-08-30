import { Funnel, LabelList, FunnelChart as RechartsFunnel, Tooltip } from "recharts";
import { ANIMATION_PROPS, chartFontSize, chartTooltipProps } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS, chartAxis } from "./palette";
import { FUNNEL_SAMPLE, type NamedValue } from "./sample";

export function FunnelChart({
	data = FUNNEL_SAMPLE,
	ariaLabel = "Funnel chart",
	className,
	valueFormatter,
}: {
	data?: NamedValue[];
	ariaLabel?: string;
	className?: string;
	valueFormatter?: (value: number) => string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsFunnel>
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: false })} />
				<Funnel
					data={data}
					dataKey="value"
					nameKey="name"
					fill={CHART_COLORS[1]}
					{...ANIMATION_PROPS}
				>
					<LabelList
						dataKey="name"
						position="right"
						fill={chartAxis}
						stroke="none"
						fontSize={chartFontSize("axis")}
					/>
				</Funnel>
			</RechartsFunnel>
		</ChartFrame>
	);
}
