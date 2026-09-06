import type { ReactNode } from "react";
import {
	LineChart,
	type LineChartAxisDomain,
	type LineChartLegendRenderer,
	type LineChartNumericKeys,
	type LineChartTooltipRenderer,
} from "./line";
import type { ChartSeriesDescriptor, XYPoint } from "./series";

export type ChartsProps<
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
	color?: string;
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

export function Charts<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
>({
	data,
	series,
	ariaLabel = "Charts",
	className,
	showAxes = false,
	showLegend = false,
	color,
	valueFormatter,
	xValueFormatter,
	yDomain,
	legend,
	customTooltip,
	summary,
	dataAlternative,
	accessibilityLayer,
}: ChartsProps<TData, K>) {
	return (
		<LineChart
			data={data}
			series={series}
			ariaLabel={ariaLabel}
			className={className}
			showAxes={showAxes}
			showLegend={showLegend}
			color={color}
			valueFormatter={valueFormatter}
			xValueFormatter={xValueFormatter}
			yDomain={yDomain}
			legend={legend}
			customTooltip={customTooltip}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		/>
	);
}
