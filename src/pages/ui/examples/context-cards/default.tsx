import { ContextCards, type ContextChunk } from "@nocoo/basalt/components/context-cards";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { useState } from "react";

const chunks: ContextChunk[] = [
	{
		id: "sop",
		title: "Patient intake rule",
		characters: 290,
		body: "Patient consent must be verified before a new care plan enters the follow-up workflow.",
		source: {
			name: "Patient Intake Guide.pdf",
			type: "PDF",
			href: "https://example.com/patient-intake",
		},
	},
	{
		id: "velocity",
		title: "Quarterly care progress",
		characters: 1250,
		body: "Q4 care progress: sleep +18%, activity +6%, recovery -11%; review trends below the weekly baseline.",
		source: { name: "Care Progress Export.csv", type: "CSV" },
	},
];
export default function ContextCardsDemo() {
	const [state, setState] = useState("ready");
	return (
		<div className="w-full space-y-basalt-space-lg">
			<ContextCards
				chunks={state === "empty" ? [] : chunks}
				totalCount={state === "empty" ? 0 : 32}
				loading={state === "loading"}
				error={state === "error" ? "Could not retrieve context." : undefined}
				onRetry={() => setState("ready")}
			/>
			<SegmentControl
				legend="Context state"
				value={state}
				onValueChange={setState}
				options={["ready", "loading", "empty", "error"].map((value) => ({ value, label: value }))}
			/>
		</div>
	);
}
