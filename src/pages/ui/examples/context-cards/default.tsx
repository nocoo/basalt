import { ContextCards, type ContextChunk } from "@nocoo/basalt/components/context-cards";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { useState } from "react";

const chunks: ContextChunk[] = [
	{
		id: "sop",
		title: "Vendor onboarding rule",
		characters: 290,
		body: "Cold-chain certification must be verified before a new dairy can be added to the reorder workflow.",
		source: {
			name: "Dairy Onboarding SOP.pdf",
			type: "PDF",
			href: "https://example.com/dairy-onboarding",
		},
	},
	{
		id: "velocity",
		title: "Seasonal demand row",
		characters: 1250,
		body: "Q4 velocity table: pistachio +18%, vanilla +6%, rocky road -11%; retire flavors below 40 scoops weekly.",
		source: { name: "Sales Velocity Export.csv", type: "CSV" },
	},
];
export default function ContextCardsDemo() {
	const [state, setState] = useState("ready");
	return (
		<div className="w-full space-y-basalt-3">
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
