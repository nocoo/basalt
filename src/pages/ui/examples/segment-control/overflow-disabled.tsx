import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { useState } from "react";

const rangeOptions = [
	{ value: "today", label: "Today" },
	{ value: "week", label: "7 days" },
	{ value: "month", label: "30 days" },
	{ value: "quarter", label: "90 days", disabled: true },
	{ value: "year", label: "12 months" },
] as const;

export default function OverflowDisabledExample() {
	const [range, setRange] = useState("today");

	return (
		<SegmentControl
			legend="Range"
			value={range}
			onValueChange={setRange}
			options={rangeOptions}
			className="max-w-64"
		/>
	);
}
