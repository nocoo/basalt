import type { ReactNode } from "react";
import { Line, LineChart as RechartsLine } from "recharts";
import { ANIMATION_PROPS, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import { resolveChartSeries, type XYPoint, type XYSeriesDescriptor } from "./series";

export type SparklineProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
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

export function Sparkline({
	data,
	series,
	ariaLabel = "Sparkline",
	className,
	summary,
	dataAlternative,
	accessibilityLayer,
}: SparklineProps) {
	const lines = resolveChartSeries(series, ["y"]);
	return (
		<ChartFrame
			ariaLabel={ariaLabel}
			className={className}
			size="h-10 w-28"
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<RechartsLine data={data}>
				{lines.map((item, index) => (
					<Line
						key={item.key}
						type="monotone"
						dataKey={item.key}
						name={item.label ?? item.key}
						stroke={seriesColor(item, index)}
						dot={false}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsLine>
		</ChartFrame>
	);
}
