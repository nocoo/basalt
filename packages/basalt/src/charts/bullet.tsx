import type { ReactNode } from "react";
import { Bar, BarChart as RechartsBar, Tooltip, XAxis, YAxis } from "recharts";
import { ANIMATION_PROPS, cartesianAxisProps, chartTooltipProps, seriesColor } from "./config";
import { ChartFrame } from "./frame";
import { type BulletPoint, type BulletSeriesDescriptor, resolveChartSeries } from "./series";

export type BulletChartProps = {
	data: BulletPoint[];
	series?: BulletSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showAxes?: boolean;
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

export function BulletChart({
	data,
	series,
	ariaLabel = "Bullet chart",
	className,
	showAxes = true,
	valueFormatter,
	summary,
	dataAlternative,
	accessibilityLayer,
}: BulletChartProps) {
	const bars = resolveChartSeries(series, ["target", "value"]);
	return (
		<ChartFrame
			ariaLabel={ariaLabel}
			className={className}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<RechartsBar data={data} layout="vertical">
				<XAxis type="number" {...cartesianAxisProps(!showAxes)} tickFormatter={valueFormatter} />
				<YAxis type="category" dataKey="name" {...cartesianAxisProps(!showAxes)} />
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: "bar" })} />
				{bars.map((item) => (
					<Bar
						key={item.key}
						dataKey={item.key}
						name={item.label ?? item.key}
						fill={seriesColor(item, item.key === "target" ? 6 : 1)}
						barSize={item.key === "target" ? 10 : 6}
						{...ANIMATION_PROPS}
					/>
				))}
			</RechartsBar>
		</ChartFrame>
	);
}
