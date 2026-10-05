import viewModelSource from "@/viewmodels/useAgentFeedbackDemo?raw";
import { catalogContentFamily } from "../../catalog-content";
import ApprovalDemo from "../../examples/approval-card/default";
import approvalSource from "../../examples/approval-card/default?raw";
import RecommendationDemo from "../../examples/recommendation-card/default";
import recommendationSource from "../../examples/recommendation-card/default?raw";
import ThinkingDemo from "../../examples/thinking/default";
import thinkingSource from "../../examples/thinking/default?raw";
import ToolChipsDemo from "../../examples/tool-chips/default";
import toolsSource from "../../examples/tool-chips/default?raw";
import { API as approvalApi } from "../../generated/catalog-api/approval-card";
import { API as recommendationApi } from "../../generated/catalog-api/recommendation-card";
import { API as thinkingApi } from "../../generated/catalog-api/thinking";
import { API as toolsApi } from "../../generated/catalog-api/tool-chips";

function standaloneDemo(source: string, tool: boolean) {
	const hooks = viewModelSource
		.replace(/^import .*;\n/gm, "")
		.replace("export function", "function");
	const imports = `import { useEffect, useState } from "react";\nimport type { ThinkingStep${tool ? ", ThinkingVariant" : ""} } from "@nocoo/basalt/components/thinking";\nimport type { ToolStep } from "@nocoo/basalt/components/tool-chips";`;
	const component = source
		.replace('import { useState } from "react";\n', "")
		.replace('import { useAgentFeedbackDemo } from "@/viewmodels/useAgentFeedbackDemo";', imports);
	return `${component}\n${hooks}`;
}

export default catalogContentFamily({
	"recommendation-card": {
		docs: {
			description:
				"Confidence-labelled recommendation with animated alternatives, explicit asynchronous acceptance and retry. The application owns the recommended action.",
			usage:
				'import { RecommendationCard } from "@nocoo/basalt/components/recommendation-card";\nexport default function Example() { return <RecommendationCard options={[{ id: "restock", label: "Restock", description: "Reorder waffle cones.", confidence: "high" }]} onAccept={console.log} />; }',
			variants: [],
			api: recommendationApi,
		},
		examples: [
			{
				id: "recommendation-card-default",
				title: "Recommendation and alternatives",
				code: recommendationSource,
				render: () => <RecommendationDemo />,
			},
		],
	},
	thinking: {
		docs: {
			description:
				"Expandable agent trace with caller-owned statuses. Steps, reasoning, search and coding share an accessible disclosure and reduced-motion-safe transitions.",
			usage:
				'import { Thinking } from "@nocoo/basalt/components/thinking";\nexport default function Example() { return <Thinking steps={[{ id: "read", label: "Reading context", status: "running" }]} />; }',
			variants: [],
			api: thinkingApi,
		},
		examples: [
			{
				id: "thinking-default",
				title: "Live trace",
				code: standaloneDemo(thinkingSource, false),
				render: () => <ThinkingDemo />,
			},
		],
	},
	"approval-card": {
		docs: {
			description:
				"Human approval form with single and multiple choice, custom answers, explicit final submission and retry-safe asynchronous errors. Question state lives in a ViewModel; no action executes without onSubmit.",
			usage:
				'import { ApprovalCard } from "@nocoo/basalt/components/approval-card";\nexport default function Example() { return <ApprovalCard questions={[{ id: "plan", label: "Choose a plan", type: "single", options: [{ id: "core", label: "Core" }] }]} onSubmit={console.log} />; }',
			variants: [],
			api: approvalApi,
		},
		examples: [
			{
				id: "approval-card-default",
				title: "Multi-step approval",
				code: approvalSource,
				render: () => <ApprovalDemo />,
			},
		],
	},
	"tool-chips": {
		docs: {
			description:
				"Compact agent tool calls with status, expandable output and accessible file-diff popovers. Execution and progress remain caller-owned.",
			usage:
				'import { ToolChips } from "@nocoo/basalt/components/tool-chips";\nexport default function Example() { return <ToolChips steps={[{ id: "read", kind: "read", label: "Read context", target: "notes.md", status: "complete", detail: "Context loaded" }]} />; }',
			variants: [],
			api: toolsApi,
		},
		examples: [
			{
				id: "tool-chips-default",
				title: "Tool calls and file changes",
				code: standaloneDemo(toolsSource, true),
				render: () => <ToolChipsDemo />,
			},
		],
	},
});
