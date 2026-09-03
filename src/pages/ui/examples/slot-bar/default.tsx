import { SlotBarChart } from "@nocoo/basalt/charts/slot-bar";

const items = Array.from({ length: 24 }, (_, hour) => ({
	color:
		hour < 6
			? "bg-indigo-800"
			: hour < 10
				? "bg-indigo-500"
				: hour < 16
					? "bg-emerald-600"
					: hour < 20
						? "bg-orange-500"
						: "bg-basalt-muted",
	label: `${String(hour).padStart(2, "0")}:00`,
}));

export default function SlotBarDefault() {
	return <SlotBarChart items={items} />;
}
