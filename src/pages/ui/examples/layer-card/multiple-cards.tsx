import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardMultipleCards() {
	return (
		<div className="flex w-full gap-basalt-space-lg">
			<LayerCard className="w-[12.5rem]">
				<LayerCard.Secondary>Components</LayerCard.Secondary>
				<LayerCard.Primary>Browse all components</LayerCard.Primary>
			</LayerCard>
			<LayerCard className="w-[12.5rem]">
				<LayerCard.Secondary>Examples</LayerCard.Secondary>
				<LayerCard.Primary>View code examples</LayerCard.Primary>
			</LayerCard>
		</div>
	);
}
