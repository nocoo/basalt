import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardMultipleCards() {
	return (
		<div className="flex w-full gap-4">
			<LayerCard className="w-[200px]">
				<LayerCard.Secondary>Components</LayerCard.Secondary>
				<LayerCard.Primary>Browse all components</LayerCard.Primary>
			</LayerCard>
			<LayerCard className="w-[200px]">
				<LayerCard.Secondary>Examples</LayerCard.Secondary>
				<LayerCard.Primary>View code examples</LayerCard.Primary>
			</LayerCard>
		</div>
	);
}
