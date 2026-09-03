import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { LayerCard } from "@nocoo/basalt/components/layer-card";

export default function LayerCardNestedSurfaces() {
	return (
		<LayerCard className="w-full max-w-sm">
			<LayerCard.Header>Account</LayerCard.Header>
			<LayerCard.Well>
				<DescriptionList columns={1}>
					<DescriptionList.Item term="Status">Active</DescriptionList.Item>
					<DescriptionList.Item term="Plan">Enterprise</DescriptionList.Item>
				</DescriptionList>
			</LayerCard.Well>
		</LayerCard>
	);
}
