import { SlotBarChart } from "@nocoo/basalt/charts/slot-bar";

const items = Array.from({ length: 24 }, (_, hour) => ({
	color:
		hour < 6
			? "bg-basalt-chart-1/40"
			: hour < 10
				? "bg-basalt-chart-1"
				: hour < 16
					? "bg-basalt-chart-5"
					: hour < 20
						? "bg-basalt-chart-7"
						: "bg-basalt-muted",
	label: `${String(hour).padStart(2, "0")}:00`,
}));

export default function SlotBarDefault() {
	return <SlotBarChart items={items} />;
}
