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
	resolveChartSeries,
	type XYPoint,
	type XYSeriesDescriptor,
	xyFallbackKeys,
} from "./series";

export type LineChartProps = {
	data: XYPoint[];
	series?: XYSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
	showLegend?: boolean;
	color?: string;
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

export function LineChart({
	data,
	series,
	ariaLabel = "Line chart",
	className,
	showAxes = false,
	showLegend = false,
	color,
	valueFormatter,
	summary,
	dataAlternative,
	accessibilityLayer,
}: LineChartProps) {
	const lines = applyLeadColor(resolveChartSeries(series, xyFallbackKeys(data)), color);
	return (
		<ChartShell
			ariaLabel={ariaLabel}
			className={className}
			legend={showLegend ? <ChartLegend items={lines} shape="line" /> : undefined}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<RechartsLine data={data} margin={showAxes ? CHART_PLOT_MARGIN : CHART_PLOT_MARGIN_BARE}>
				{showAxes ? <CartesianGrid {...GRID_PROPS} /> : null}
				<XAxis dataKey="x" {...cartesianAxisProps(!showAxes)} />
				<YAxis {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "line" })} />
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
