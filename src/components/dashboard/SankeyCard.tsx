import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SankeyChart } from "@/components/charts/sankey";

const data = {
	nodes: [
		{ name: "Visits" },
		{ name: "Signup" },
		{ name: "Activate" },
		{ name: "Upgrade" },
		{ name: "Churn" },
	],
	links: [
		{ source: 0, target: 1, value: 1200 },
		{ source: 1, target: 2, value: 620 },
		{ source: 2, target: 3, value: 240 },
		{ source: 2, target: 4, value: 110 },
	],
};

export function SankeyCard() {
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<h2 className="text-basalt-lg font-semibold text-basalt-foreground">User flow (Sankey)</h2>
			</LayerCard.Header>
			<LayerCard.Body className="h-64 min-w-0 shrink-0">
				<SankeyChart data={data} ariaLabel="User flow (Sankey)" className="h-full w-full" />
			</LayerCard.Body>
		</LayerCard>
	);
}
