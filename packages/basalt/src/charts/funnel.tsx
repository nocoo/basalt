import { Funnel, LabelList, FunnelChart as RechartsFunnel, Tooltip } from "recharts";
import { ANIMATION_PROPS, chartFontSize, chartTooltipProps, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import { chartAxis } from "./palette";
import type { ChartSeriesDescriptor, NamedValue } from "./series";

export type FunnelChartProps = {
	data: NamedValue[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	valueFormatter?: (value: number) => string;
};

export function FunnelChart({
	data,
	series,
	ariaLabel = "Funnel chart",
	className,
	valueFormatter,
}: FunnelChartProps) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
			<RechartsFunnel>
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: false })} />
				<Funnel
					data={data}
					dataKey="value"
					nameKey="name"
					fill={seriesColor(series?.[0], 1)}
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
