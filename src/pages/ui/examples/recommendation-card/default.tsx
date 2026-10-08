import { Button } from "@nocoo/basalt/components/button";
import {
	RecommendationCard,
	type RecommendationOption,
} from "@nocoo/basalt/components/recommendation-card";
import { useState } from "react";

const options: RecommendationOption[] = [
	{
		id: "cones",
		label: "Reorder from Cone King",
		description: "Reorder waffle cones from Cone King with lead time 7 days.",
		confidence: "high",
	},
	{
		id: "vanilla",
		label: "Switch to Vanilla Madagascar",
		description: "Switch vanilla to Vanilla Madagascar for peak season.",
		confidence: "review",
		actionLabel: "Configure",
	},
	{
		id: "all",
		label: "Full restock across every SKU",
		description: "Fall back to a full restock across every SKU.",
		confidence: "none",
		actionLabel: "Accept full restock",
	},
];
export default function RecommendationDemo() {
	const [run, setRun] = useState(0);
	const [notice, setNotice] = useState("");
	return (
		<div className="w-full space-y-basalt-space-lg">
			<RecommendationCard
				key={run}
				title="Want me to place this restock order?"
				options={options}
				onAccept={(option) => setNotice(`Accepted: ${option.label}`)}
			/>
			<div className="flex items-center gap-basalt-space-lg">
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						setRun(run + 1);
						setNotice("");
					}}
				>
					Reset recommendation
				</Button>
				<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
					{notice}
				</p>
			</div>
		</div>
	);
}
