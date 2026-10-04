import type { ReactNode } from "react";
import { Bar, Cell, BarChart as RechartsBar, XAxis, YAxis } from "recharts";
import { ANIMATION_PROPS, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import type { LineChartNumericKeys } from "./line";
import { chart } from "./palette";
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
	const bars = resolveChartSeries(series, ["y" as K]);
	return (
		<ChartFrame
			ariaLabel={ariaLabel}
			className={className}
			size="h-5 w-28"
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<RechartsBar
				data={data}
				margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
				barCategoryGap="12%"
				barGap={1}
			>
				<XAxis dataKey="x" hide />
				<YAxis hide />
				{bars.map((item, index) => (
					<Bar
						key={item.key}
						dataKey={item.key}
						name={item.label ?? item.key}
						fill={item.color ?? (bars.length === 1 ? chart.green : seriesColor(item, index))}
						radius={1}
						{...ANIMATION_PROPS}
					>
						{data.map((point, pointIndex) => (
							<Cell key={`${point.x}-${pointIndex}`} fillOpacity={pointIndex % 3 === 0 ? 0.4 : 1} />
						))}
					</Bar>
				))}
			</RechartsBar>
		</ChartFrame>
	);
}
