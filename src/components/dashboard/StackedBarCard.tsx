import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { StackedBarChart } from "@/components/charts/stacked-bar";

const data = [
	{ x: "Mon", y: 120, y2: 80, y3: 60 },
	{ x: "Tue", y: 140, y2: 90, y3: 70 },
	{ x: "Wed", y: 160, y2: 110, y3: 80 },
	{ x: "Thu", y: 150, y2: 95, y3: 75 },
	{ x: "Fri", y: 170, y2: 120, y3: 90 },
];

export function StackedBarCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col items-start">
				<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Stacked engagement</h2>
			</LayerCard.Header>
			<LayerCard.Body className="h-64 min-w-0 shrink-0">
				<StackedBarChart
					data={data}
					series={[
						{ key: "y", label: "Core" },
						{ key: "y2", label: "Growth" },
						{ key: "y3", label: "Churn" },
					]}
					ariaLabel="Stacked engagement"
					className="h-full w-full"
					showAxes
					showLegend
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
