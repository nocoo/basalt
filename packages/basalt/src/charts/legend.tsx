import { seriesColor } from "./config";
import type { ChartSeriesDescriptor } from "./series";

export type ChartLegendShape = "bar" | "line" | "area";

export type ChartLegendProps = {
	items: ChartSeriesDescriptor[];
	shape?: ChartLegendShape;
};

export function ChartLegend({ items, shape = "line" }: ChartLegendProps) {
	if (items.length === 0) {
		return null;
	}
	return (
		<div
			data-testid="chart-legend"
			style={{
				color: "hsl(var(--basalt-muted-foreground))",
				columnGap: "var(--basalt-space-default)",
				display: "flex",
				flexWrap: "wrap",
				fontSize: "var(--basalt-text-sm)",
				marginTop: "var(--basalt-space-default)",
				rowGap: "var(--basalt-space-sm)",
			}}
		>
			{items.map((item, index) => {
				const color = seriesColor(item, index) ?? "hsl(var(--basalt-chart-1))";
				const label = item.label ?? item.key;
				return (
					<div
						key={item.key}
						style={{ alignItems: "center", display: "flex", gap: "var(--basalt-space-md)" }}
					>
						<svg width="18" height="10" aria-hidden="true">
							{shape === "bar" ? (
								<rect x="1" y="2" width="16" height="6" rx="1" fill={color} />
							) : shape === "area" ? (
								<polygon points="0,8 4,4 9,6 18,2 18,8" fill={color} opacity="0.7" />
							) : (
								<line x1="0" y1="5" x2="18" y2="5" stroke={color} strokeWidth="2" />
							)}
						</svg>
						<span>{label}</span>
					</div>
				);
			})}
		</div>
	);
}
