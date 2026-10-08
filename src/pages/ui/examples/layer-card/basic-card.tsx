import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardBasicCard() {
	return (
		<LayerCard className="w-[15.625rem]">
			<LayerCard.Secondary>Next Steps</LayerCard.Secondary>
			<LayerCard.Primary>Hello</LayerCard.Primary>
		</LayerCard>
	);
}
