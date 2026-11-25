import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { AreaChart } from "@/components/charts/area";

const data = [
	{ x: "Mon", y: 120, y2: 80, y3: 30 },
	{ x: "Tue", y: 140, y2: 92, y3: 28 },
	{ x: "Wed", y: 150, y2: 96, y3: 26 },
	{ x: "Thu", y: 160, y2: 110, y3: 22 },
	{ x: "Fri", y: 170, y2: 120, y3: 18 },
];

export function StackedAreaCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col items-start">
				<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Stacked activity</h2>
			</LayerCard.Header>
			<LayerCard.Body className="h-64 min-w-0 shrink-0">
				<AreaChart
					data={data}
					series={[
						{ key: "y", label: "Core" },
						{ key: "y2", label: "Growth" },
						{ key: "y3", label: "Churn" },
					]}
					ariaLabel="Stacked activity"
					className="h-full w-full"
					showAxes
					showLegend
					stacked
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
