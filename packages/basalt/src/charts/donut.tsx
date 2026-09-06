import type { ReactNode } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { ANIMATION_PROPS, chartTooltipProps, seriesColor } from "./config";
import { ChartShell } from "./frame";
import { ChartLegend } from "./legend";
import type { ChartSeriesDescriptor, NamedValue } from "./series";

export type DonutChartProps = {
	data: NamedValue[];
	series?: ChartSeriesDescriptor[];
	ariaLabel?: string;
	className?: string;
	showLegend?: boolean;
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

export function DonutChart({
	data,
	series,
	ariaLabel = "Donut chart",
	className,
	showLegend = false,
	valueFormatter,
	summary,
	dataAlternative,
	accessibilityLayer,
}: DonutChartProps) {
	const legendItems = data.map((entry, index) => {
		const item = series?.find((candidate) => candidate.key === entry.name);
		return {
			key: `${entry.name}-${index}`,
			label: item?.label ?? entry.name,
			color: seriesColor(item, index),
		};
	});
	return (
		<ChartShell
			ariaLabel={ariaLabel}
			className={className}
			size="h-36 w-36"
			legend={showLegend ? <ChartLegend items={legendItems} shape="bar" /> : undefined}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<PieChart>
				<Pie
					data={data}
					dataKey="value"
					nameKey="name"
					innerRadius={24}
					outerRadius={48}
					stroke="none"
					{...ANIMATION_PROPS}
				>
					{data.map((entry, index) => {
						const item = series?.find((candidate) => candidate.key === entry.name);
						return <Cell key={`${entry.name}-${index}`} fill={seriesColor(item, index)} />;
					})}
				</Pie>
				<Tooltip {...chartTooltipProps({ formatter: valueFormatter, cursor: false })} />
			</PieChart>
		</ChartShell>
	);
}
