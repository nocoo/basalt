import { ApprovalCard, type ApprovalQuestion } from "@nocoo/basalt/components/approval-card";
import { Button } from "@nocoo/basalt/components/button";
import { useState } from "react";

const questions: ApprovalQuestion[] = [
	{
		id: "flavors",
		label: "How many follow-ups should we schedule?",
		type: "single",
		options: [
			{ id: "three", label: "Three visits" },
			{ id: "five", label: "Five visits" },
			{ id: "one", label: "One visit" },
		],
	},
	{
		id: "mix",
		label: "Which care steps should we review?",
		type: "multiple",
		allowCustom: true,
		options: [
			{ id: "chips", label: "Follow-up appointment" },
			{ id: "waffle", label: "Medication review" },
			{ id: "sprinkles", label: "Vitals check" },
		],
	},
	{
		id: "market",
		label: "Which appointment format works best?",
		type: "single",
		required: false,
		options: [
			{ id: "trucks", label: "Video visit" },
			{ id: "grocery", label: "Clinic visit" },
			{ id: "shops", label: "Home visit" },
		],
	},
];

export default function ApprovalDemo() {
	const [run, setRun] = useState(0);
	const [result, setResult] = useState("");
	return (
		<div className="w-full space-y-basalt-space-lg">
			<ApprovalCard
				key={run}
				questions={questions}
				onSubmit={(answers) => setResult(JSON.stringify(answers))}
			/>
			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					setRun(run + 1);
					setResult("");
				}}
			>
				Reset approval
			</Button>
			{result && (
				<pre
					role="status"
					className="overflow-x-auto text-basalt-sm"
					aria-label="Submitted answers"
				>
					{result}
				</pre>
			)}
		</div>
	);
}
