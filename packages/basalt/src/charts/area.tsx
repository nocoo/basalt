import type { ReactNode } from "react";
import { Area, CartesianGrid, AreaChart as RechartsArea, Tooltip, XAxis, YAxis } from "recharts";
import {
	ANIMATION_PROPS,
	CHART_PLOT_MARGIN,
	CHART_PLOT_MARGIN_BARE,
	CHART_TYPE,
	cartesianAxisProps,
	chartTooltipProps,
	GRID_PROPS,
	seriesColor,
} from "./config";
import { ChartShell } from "./frame";
import { ChartLegend } from "./legend";
import type {
	LineChartAxisDomain,
	LineChartLegendRenderer,
	LineChartNumericKeys,
	LineChartTooltipRenderer,
} from "./line";
import {
	type ChartSeriesDescriptor,
	resolveChartSeries,
	type XYPoint,
	xyFallbackKeys,
} from "./series";

export type AreaChartProps<
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
	stacked?: boolean;
	/**
	 * Stacking offset algorithm (e.g. "expand" for 100% normalized percentage area stacks).
	 */
	stackOffset?: "none" | "expand" | "wiggle" | "silhouette";
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

export function AreaChart<
	TData extends { x: string | number } = XYPoint,
	K extends LineChartNumericKeys<TData> & string = LineChartNumericKeys<TData> & string,
>({
	data,
	series,
	ariaLabel = "Area chart",
	className,
	showAxes = false,
	showLegend = false,
	stacked = false,
	stackOffset,
	valueFormatter,
	xValueFormatter,
	yDomain,
	legend,
	customTooltip,
	summary,
	dataAlternative,
	accessibilityLayer,
}: AreaChartProps<TData, K>) {
	const areas = resolveChartSeries(
		series,
		xyFallbackKeys(data as unknown as Array<{ y2?: number; y3?: number }>) as K[],
	);
	const stackId = stacked || stackOffset ? "stack" : undefined;
	const resolvedLegend =
		legend !== undefined ? (
			typeof legend === "function" ? (
				legend({ items: areas })
			) : (
				legend
			)
		) : showLegend ? (
			<ChartLegend items={areas} shape="area" />
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
			<RechartsArea
				data={data}
				margin={showAxes ? CHART_PLOT_MARGIN : CHART_PLOT_MARGIN_BARE}
				stackOffset={stackOffset}
			>
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
				{areas.map((item, index) => {
					const fill = seriesColor(item, index);
					return (
						<Area
							key={item.key}
							dataKey={item.key}
							name={item.label ?? item.key}
							stackId={stackId}
							stroke={fill}
							fill={fill}
							fillOpacity={CHART_TYPE.areaFillAlpha}
							{...ANIMATION_PROPS}
						/>
					);
				})}
			</RechartsArea>
		</ChartShell>
	);
}
