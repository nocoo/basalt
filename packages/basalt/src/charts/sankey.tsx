import { Sankey, type SankeyNodeProps, Tooltip } from "recharts";
import { chartFontSize, chartTooltipProps } from "./config";
import { ChartFrame } from "./frame";
import { CHART_COLORS, chartAxis } from "./palette";
import { SANKEY_SAMPLE, type SankeyData } from "./sample";

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

export function SankeyChart({
	data = SANKEY_SAMPLE,
	ariaLabel = "Sankey chart",
	className,
}: {
	data?: SankeyData;
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ChartFrame ariaLabel={ariaLabel} className={className}>
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
