import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { HeatmapCalendar, heatmapColorScales } from "@/components/charts/heatmap-calendar";

const heatmapData = Array.from({ length: 365 }).map((_, i) => {
	const date = new Date(Date.UTC(2026, 0, 1 + i));
	const noise = Math.sin(i * 12.9898) * 43758.5453;
	const random = noise - Math.floor(noise);
	const value = Math.max(1, Math.round(3 + random * 9));
	return {
		date: date.toISOString().slice(0, 10),
		value,
	};
});

export function HeatmapCard() {
	return (
		<LayerCard className="flex h-full flex-col">
			<LayerCard.Header className="flex-col items-start">
				<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Engagement heatmap</h2>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1">
				<HeatmapCalendar
					ariaLabel="Engagement heatmap"
					data={heatmapData}
					year={2026}
					colorScale={heatmapColorScales.blue}
					metricLabel="Sessions"
					locale="en-US"
					lessLabel="Less"
					moreLabel="More"
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
