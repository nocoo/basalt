import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { useState } from "react";

const statusOptions = [
	{ value: "ready", label: "Ready" },
	{ value: "planned", label: "Planned" },
] as const;

export default function ControlledStatusExample() {
	const [status, setStatus] = useState("all");

	return (
		<SegmentControl
			legend="Status"
			value={status}
			onValueChange={setStatus}
			allOption={{ value: "all" }}
			options={statusOptions}
		/>
	);
}
