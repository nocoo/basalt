import type { ReactNode } from "react";
import { Sankey, type SankeyNodeProps, Tooltip } from "recharts";
import { chartFontSize, chartTooltipProps } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS, chartAxis } from "./palette";
import type { SankeyData } from "./series";

function SankeyNode({ x, y, width, height, payload }: SankeyNodeProps) {
	return (
		<g>
			<rect x={x} y={y} width={width} height={height} fill={CHART_COLORS[2]} />
			<text
				x={x + width + 6}
				y={y + height / 2}
				dominantBaseline="middle"
				fontSize={chartFontSize("axis")}
				fill={chartAxis}
			>
				{payload.name}
			</text>
		</g>
	);
}

export type SankeyChartProps = {
	data: SankeyData;
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

export function SankeyChart({
	data,
	ariaLabel = "Sankey chart",
	className,
	summary,
	dataAlternative,
	accessibilityLayer,
}: SankeyChartProps) {
	return (
		<ChartFrame
			ariaLabel={ariaLabel}
			className={className}
			summary={summary}
			dataAlternative={dataAlternative}
			accessibilityLayer={accessibilityLayer}
		>
			<Sankey
				data={data}
				nodePadding={16}
				nodeWidth={12}
				margin={{ top: 8, right: 72, bottom: 8, left: 8 }}
				node={SankeyNode}
				link={{ stroke: CHART_COLORS[0], strokeOpacity: 0.3 }}
			>
				<Tooltip {...chartTooltipProps({ cursor: false })} />
			</Sankey>
		</ChartFrame>
	);
}
