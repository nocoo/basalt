import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { useState } from "react";

const viewOptions = [
	{ value: "overview", label: "Overview" },
	{ value: "activity", label: "Activity" },
	{ value: "settings", label: "Settings" },
] as const;

export default function WithLegendExample() {
	const [view, setView] = useState("overview");

	return (
		<SegmentControl legend="View mode" value={view} onValueChange={setView} options={viewOptions} />
	);
}
