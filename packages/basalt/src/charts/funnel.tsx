import type { ReactNode } from "react";
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
	/**
	 * Textual summary describing key insights, highs, lows, and keyboard exploration instructions.
	 * Associated with the chart via useId and aria-describedby.
	 */
	summary?: ReactNode;
	/**
	 * Accessible tabular or structured data alternative rendered outside the plot area.
	 */
	dataAlternative?: ReactNode;
	/**
	 * Whether the interactive accessibility layer is enabled on the underlying Recharts graphic.
	 * Enables keyboard exploration with Tab and arrow keys where supported by the underlying chart type.
	 * Non-interactive compact or decorative charts without tooltip navigation should provide summary or dataAlternative.
	 * @default true
	 */
	accessibilityLayer?: boolean;
};

export function FunnelChart({
	data,
	series,
	ariaLabel = "Funnel chart",
	className,
	valueFormatter,
	summary,
	dataAlternative,
	accessibilityLayer,
}: FunnelChartProps) {
	return (
		<ChartFrame
			ariaLabel={ariaLabel}
			className={className}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
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
