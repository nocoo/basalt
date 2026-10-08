import type { ThinkingStep, ThinkingVariant } from "@nocoo/basalt/components/thinking";
import type { ToolStep } from "@nocoo/basalt/components/tool-chips";
import { useEffect, useState } from "react";

const TRACES: Record<ThinkingVariant, readonly string[]> = {
	steps: [
		"Reading care reports",
		"Reviewing appointment records",
		"Comparing wellness summaries",
		"Writing the care summary",
	],
	reasoning: [
		"Recent activity patterns are summarized for the care team.",
		"Review appointment availability before preparing the care report.",
	],
	search: [
		"Care Admin · care-admin.example",
		"Wellness Records · wellness.example",
		"Appointment Desk · appointments.example",
	],
	coding: ["Read care-reports.ts", "Edit AppointmentReview.tsx", "Run bun run verify"],
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
			target: "Care report",
			detail: "The simulated care summary is ready for review.",
			status: status(0),
		},
		{
			id: "write",
			kind: "write",
			label: "Write 204 lines",
			target: "AppointmentReview.tsx",
			detail: '+ return schedule(windows, { hero: "wellness-summary" })',
			status: status(1),
		},
		{
			id: "run",
			kind: "run",
			label: "Rebuild and verify",
			target: "npm run freeze",
			detail: "Prepared in 1.2s\n34 checks passed",
			status: status(2),
		},
		{
			id: "read",
			kind: "read",
			label: "Read report",
			target: "wellness-report.png",
			detail: "Wellness activity trends upward through July.",
			status: status(3),
		},
	];
	return { steps, tools, restart: () => setStage(0) };
}
