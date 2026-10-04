import type { ThinkingStep, ThinkingVariant } from "@nocoo/basalt/components/thinking";
import type { ToolStep } from "@nocoo/basalt/components/tool-chips";
import { useEffect, useState } from "react";

const TRACES: Record<ThinkingVariant, readonly string[]> = {
	steps: [
		"Reading flavor briefs",
		"Scanning supplier lists",
		"Comparing tasting notes",
		"Writing the scoop report",
	],
	reasoning: [
		"Summer demand favors stone-fruit flavors.",
		"Check cone inventory before promoting a waffle-bowl special.",
	],
	search: [
		"Joy Cone · joycone.com",
		"WebstaurantStore · webstaurantstore.com",
		"The Konery · thekonery.com",
	],
	coding: ["Read flavors.ts", "Edit ChurnSchedule.tsx", "Run npm run freeze"],
};

export function useAgentFeedbackDemo(variant: ThinkingVariant = "steps") {
	const [stage, setStage] = useState(0);
	useEffect(() => {
		if (stage >= 4) return;
		const timer = setTimeout(() => setStage(stage + 1), 900);
		return () => clearTimeout(timer);
	}, [stage]);
	const status = (index: number) =>
		stage > index
			? ("complete" as const)
			: stage === index
				? ("running" as const)
				: ("pending" as const);
	const steps: ThinkingStep[] = TRACES[variant].map((label, index) => ({
		id: String(index),
		label,
		status: status(index),
	}));
	const tools: ToolStep[] = [
		{
			id: "plan",
			kind: "think",
			label: "Thinking",
			target: "Churn schedule",
			detail: "Weekend demand carries pistachio, so it churns first.",
			status: status(0),
		},
		{
			id: "write",
			kind: "write",
			label: "Write 204 lines",
			target: "ChurnSchedule.tsx",
			detail: '+ return schedule(windows, { hero: "pistachio" })',
			status: status(1),
		},
		{
			id: "run",
			kind: "run",
			label: "Rebuild and verify",
			target: "npm run freeze",
			detail: "Built in 1.2s\n34 checks passed",
			status: status(2),
		},
		{
			id: "read",
			kind: "read",
			label: "Read image",
			target: "flavor-chart.png",
			detail: "Mint chip trends up 12% through July.",
			status: status(3),
		},
	];
	return { steps, tools, restart: () => setStage(0) };
}
