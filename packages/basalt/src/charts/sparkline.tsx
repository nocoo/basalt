import type { ReactNode } from "react";
import { Line, LineChart as RechartsLine } from "recharts";
import { ANIMATION_PROPS, CHART_TYPE, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import type { LineChartNumericKeys } from "./line";
import { type ChartSeriesDescriptor, resolveChartSeries, type XYPoint } from "./series";

export type SparklineProps<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
> = {
	/**
	 * Dataset array where each record requires an `x` category or time coordinate.
	 * Any remaining fields with numeric, nullable, or optional number values are inferred as valid series keys.
	 */
	data: TData[];
	/**
	 * Series descriptors identifying which numeric keys to plot.
	 * Inferred strictly from numeric keys of `TData` (rejects non-numeric fields, `x`, and typos).
	 */
	series?: Array<ChartSeriesDescriptor<NoInfer<K>>>;
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

export function Sparkline<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
>({
	data,
	series,
	ariaLabel = "Sparkline",
	className,
	summary,
	dataAlternative,
	accessibilityLayer,
}: SparklineProps<TData, K>) {
	const lines = resolveChartSeries(series, ["y" as K]);
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
						strokeWidth={CHART_TYPE.strokeWidth}
						dot={false}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsLine>
		</ChartFrame>
	);
}
