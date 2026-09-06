import type { ReactNode } from "react";
import { CartesianGrid, Line, LineChart as RechartsLine, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	CHART_PLOT_MARGIN,
	CHART_PLOT_MARGIN_BARE,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
	seriesColor,
} from "./config";
import { ChartShell } from "./frame";
import { ChartLegend } from "./legend";
import {
	applyLeadColor,
	type ChartSeriesDescriptor,
	resolveChartSeries,
	type XYPoint,
	xyFallbackKeys,
} from "./series";
import type { ChartTooltipItem } from "./tooltip";

export type LineChartAxisDomain =
	| [number | "auto" | "dataMin", number | "auto" | "dataMax"]
	| readonly [number | "auto" | "dataMin", number | "auto" | "dataMax"];

export type LineChartNumericKeys<T> = {
	[K in keyof T]-?: K extends "x"
		? never
		: [NonNullable<T[K]>] extends [never]
			? never
			: NonNullable<T[K]> extends number
				? K extends string
					? K
					: never
				: never;
}[keyof T];

export type LineChartLegendRenderer<K extends string = string> = (props: {
	items: Array<ChartSeriesDescriptor<K>>;
}) => ReactNode;

export type LineChartTooltipRenderer = (props: {
	active?: boolean;
	payload?: readonly ChartTooltipItem[];
	label?: string | number;
}) => ReactNode;

export type LineChartProps<
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

export function LineChart<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
>({
	data,
	series,
	ariaLabel = "Line chart",
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
}: LineChartProps<TData, K>) {
	const lines = applyLeadColor(
		resolveChartSeries(
			series,
			xyFallbackKeys(data as unknown as Array<{ y2?: number; y3?: number }>) as K[],
		),
		color,
	);
	const resolvedLegend =
		legend !== undefined ? (
			typeof legend === "function" ? (
				legend({ items: lines })
			) : (
				legend
			)
		) : showLegend ? (
			<ChartLegend items={lines} shape="line" />
		) : undefined;

	return (
		<ChartShell
			ariaLabel={ariaLabel}
			className={className}
			legend={resolvedLegend}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<RechartsLine data={data} margin={showAxes ? CHART_PLOT_MARGIN : CHART_PLOT_MARGIN_BARE}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} tickFormatter={xValueFormatter} />
				<YAxis
					{...cartesianAxisProps(!showAxes)}
					tickFormatter={valueFormatter}
					{...(yDomain ? { domain: yDomain as [number, number] } : {})}
				/>
				<Tooltip
					{...chartTooltipProps({
						formatter: valueFormatter,
						cursor: "line",
						customTooltip,
					})}
				/>
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
		</ChartShell>
	);
}
