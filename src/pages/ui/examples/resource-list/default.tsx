import { ResourceList } from "@nocoo/basalt/components/resource-list";

export default function ResourceListDefault() {
	return <ResourceList title="Projects" data={[{ name: "Atlas", status: "Active" }]} />;
}
