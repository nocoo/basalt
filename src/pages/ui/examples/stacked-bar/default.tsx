import { StackedBarChart } from "@nocoo/basalt/charts/stacked-bar";

export default function StackedBarDefault() {
	return <StackedBarChart data={[{ x: "Mon", y: 12, y2: 8 }]} />;
}
