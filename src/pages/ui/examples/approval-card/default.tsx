import { ApprovalCard, type ApprovalQuestion } from "@nocoo/basalt/components/approval-card";
import { Button } from "@nocoo/basalt/components/button";
import { useState } from "react";

const questions: ApprovalQuestion[] = [
	{
		id: "flavors",
		label: "How many flavors should we launch?",
		type: "single",
		options: [
			{ id: "three", label: "Three (core line)" },
			{ id: "five", label: "Five (full case)" },
			{ id: "one", label: "Just one hero" },
		],
	},
	{
		id: "mix",
		label: "Which mix-ins should we stock?",
		type: "multiple",
		allowCustom: true,
		options: [
			{ id: "chips", label: "Chocolate chips" },
			{ id: "waffle", label: "Waffle bits" },
			{ id: "sprinkles", label: "Sprinkles" },
		],
	},
	{
		id: "market",
		label: "Which market do we enter first?",
		type: "single",
		required: false,
		options: [
			{ id: "trucks", label: "Food trucks" },
			{ id: "grocery", label: "Grocery freezers" },
			{ id: "shops", label: "Scoop shops" },
		],
	},
];

export default function ApprovalDemo() {
	const [run, setRun] = useState(0);
	const [result, setResult] = useState("");
	return (
		<div className="w-full space-y-3">
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
				<pre role="status" className="overflow-x-auto text-xs" aria-label="Submitted answers">
					{result}
				</pre>
			)}
		</div>
	);
}
