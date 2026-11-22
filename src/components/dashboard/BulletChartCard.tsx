import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { BulletChart } from "@/components/charts/bullet";

const data = [
	{ name: "Care adherence", value: 68, target: 80 },
	{ name: "Follow-up completion", value: 72, target: 85 },
	{ name: "Plan participation", value: 58, target: 70 },
];

export function BulletChartCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Bullet KPIs</h2>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 h-56">
				<BulletChart data={data} ariaLabel="Bullet KPIs" className="h-full w-full" />
			</LayerCard.Body>
		</LayerCard>
	);
}
