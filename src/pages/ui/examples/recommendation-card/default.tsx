import { Button } from "@nocoo/basalt/components/button";
import {
	RecommendationCard,
	type RecommendationOption,
} from "@nocoo/basalt/components/recommendation-card";
import { useState } from "react";

const options: RecommendationOption[] = [
	{
		id: "cones",
		label: "Follow-up for Jordan Lee",
		description: "Schedule a follow-up for Jordan Lee within 7 days.",
		confidence: "high",
	},
	{
		id: "vanilla",
		label: "Review sleep routine",
		description: "Review the sleep routine before the next follow-up.",
		confidence: "review",
		actionLabel: "Configure",
	},
	{
		id: "all",
		label: "Review all care plan items",
		description: "Review every care plan item together.",
		confidence: "none",
		actionLabel: "Accept full care plan update",
	},
];
export default function RecommendationDemo() {
	const [run, setRun] = useState(0);
	const [notice, setNotice] = useState("");
	return (
		<div className="w-full space-y-basalt-space-lg">
			<RecommendationCard
				key={run}
				title="Review these follow-up recommendations?"
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
