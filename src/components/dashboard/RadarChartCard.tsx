import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { RadarChart } from "@/components/charts/radar";

const radarData = [
	{ subject: "Speed", value: 80 },
	{ subject: "Quality", value: 92 },
	{ subject: "Coverage", value: 76 },
	{ subject: "Reliability", value: 88 },
	{ subject: "Support", value: 70 },
];

export function RadarChartCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Capability radar</h2>
			</LayerCard.Header>
			<LayerCard.Body className="h-64 min-w-0 shrink-0">
				<RadarChart data={radarData} ariaLabel="Capability radar" className="h-full w-full" />
			</LayerCard.Body>
		</LayerCard>
	);
}
