import { DescriptionList } from "@nocoo/basalt/components/description-list";

export default function DescriptionListDefault() {
	return (
		<DescriptionList>
			<DescriptionList.Item term="Status">Active</DescriptionList.Item>
			<DescriptionList.Item term="Plan">Enterprise</DescriptionList.Item>
			<DescriptionList.Item term="Created">Jan 15, 2026</DescriptionList.Item>
			<DescriptionList.Item term="Last login">2 hours ago</DescriptionList.Item>
		</DescriptionList>
	);
}
