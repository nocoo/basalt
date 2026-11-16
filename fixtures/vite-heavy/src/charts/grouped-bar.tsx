import type { ReactNode } from "react";
import { BarChart } from "./bar";
import type {
	LineChartAxisDomain,
	LineChartLegendRenderer,
	LineChartNumericKeys,
	LineChartTooltipRenderer,
} from "./line";
import { type ChartSeriesDescriptor, resolveChartSeries, type XYPoint } from "./series";

export type GroupedBarChartProps<
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
	showAxes?: boolean;
	showLegend?: boolean;
	/**
	 * Value formatter for Y-axis tick values and fallback tooltip values.
	 */
	valueFormatter?: (value: number) => string;
	/**
	 * Formatter for X-axis category or time tick labels.
	 */
	xValueFormatter?: (value: string | number) => string;
	/**
	 * Custom numerical or keyword bounds for the Y-axis.
	 */
	yDomain?: LineChartAxisDomain;
	/**
	 * Custom legend slot or render function receiving resolved series descriptors.
	 */
	legend?: ReactNode | LineChartLegendRenderer<K>;
	/**
	 * Custom tooltip content renderer receiving Recharts payload, active status, and coordinate label.
	 */
	customTooltip?: LineChartTooltipRenderer;
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

export function GroupedBarChart<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
>({ series, ariaLabel = "Grouped bar chart", ...props }: GroupedBarChartProps<TData, K>) {
	const resolvedSeries = resolveChartSeries(series, ["y", "y2"] as K[]);
	return (
		<BarChart<TData, K>
			series={resolvedSeries}
			ariaLabel={ariaLabel}
			{...props}
			color={undefined}
		/>
	);
}
