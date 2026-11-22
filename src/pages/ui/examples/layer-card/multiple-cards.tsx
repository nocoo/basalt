import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardMultipleCards() {
	return (
		<div className="flex w-full gap-basalt-space-lg">
			<LayerCard className="w-[12.5rem]">
				<LayerCard.Header>Components</LayerCard.Header>
				<LayerCard.Well>Browse all components</LayerCard.Well>
			</LayerCard>
			<LayerCard className="w-[12.5rem]">
				<LayerCard.Header>Examples</LayerCard.Header>
				<LayerCard.Well>View code examples</LayerCard.Well>
			</LayerCard>
		</div>
	);
}
