import { Sankey } from "recharts";
import { ChartFrame } from "./frame";
import { CHART_COLORS } from "./palette";
import { SANKEY_SAMPLE, type SankeyData } from "./sample";

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
				node={{ fill: CHART_COLORS[2] }}
				link={{ stroke: CHART_COLORS[0], strokeOpacity: 0.3 }}
			/>
		</ChartFrame>
	);
}
