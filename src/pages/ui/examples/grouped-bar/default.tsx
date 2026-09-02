import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";

export default function GroupedBarDefault() {
	return <GroupedBarChart data={[{ x: "Mon", y: 12, y2: 8 }]} />;
}
