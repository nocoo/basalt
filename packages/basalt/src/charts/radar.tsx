import type { ReactNode } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadar } from "recharts";
import { ANIMATION_PROPS, chartTickStyle, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import type { ChartSeriesDescriptor, RadarPoint } from "./series";

export type RadarChartProps = {
	data: RadarPoint[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
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

export function RadarChart({
	data,
	series,
	ariaLabel = "Radar chart",
	className,
	summary,
	dataAlternative,
	accessibilityLayer,
}: RadarChartProps) {
	const fill = seriesColor(series?.[0], 3);
	return (
		<ChartFrame
			ariaLabel={ariaLabel}
			className={className}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<RechartsRadar data={data} outerRadius={60}>
				<PolarGrid />
				<PolarAngleAxis dataKey="subject" tick={chartTickStyle()} tickLine={false} />
				<Radar
					dataKey="value"
					name={series?.[0]?.label}
					fill={fill}
					fillOpacity={0.3}
					stroke={fill}
					{...ANIMATION_PROPS}
				/>
			</RechartsRadar>
		</ChartFrame>
	);
}
