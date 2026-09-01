import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardLoadingEmpty() {
	return (
		<div className="grid w-full gap-4 md:grid-cols-2">
			<LayerCard>
				<LayerCard.Loading label="Loading account activity" />
			</LayerCard>
			<LayerCard>
				<LayerCard.Empty title="No activity" description="New events will appear here." />
			</LayerCard>
		</div>
	);
}
