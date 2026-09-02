import { Timeline } from "@nocoo/basalt/charts/timeline";

export default function TimelineDefault() {
	return <Timeline items={[{ id: "created", title: "Created", at: "Mon" }]} />;
}
