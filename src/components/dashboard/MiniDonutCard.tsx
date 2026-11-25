import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { DonutChartWidget } from "@/components/dashboard/PieChartWidget";

const data = [
	{ label: "Active", value: 62 },
	{ label: "Idle", value: 28 },
	{ label: "Churn", value: 10 },
];

export function MiniDonutCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col items-start">
				<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Mini donut</h2>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex items-center gap-basalt-card">
				<div className="h-24 w-24">
					<DonutChartWidget
						data={data}
						ariaLabel={data.map((item) => `${item.label} ${item.value}%`).join(", ")}
						height={96}
					/>
				</div>
				<div className="space-y-basalt-card-sm text-basalt-sm text-basalt-muted-foreground">
					{data.map((item) => (
						<div key={item.label} className="flex items-center justify-between gap-basalt-space-lg">
							<span>{item.label}</span>
							<span className="text-basalt-foreground">{item.value}%</span>
						</div>
					))}
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
