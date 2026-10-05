import viewModelSource from "@/viewmodels/useAgentFeedbackDemo?raw";
import { catalogContentFamily } from "../../catalog-content";
import ApprovalDemo from "../../examples/approval-card/default";
import approvalSource from "../../examples/approval-card/default?raw";
import ContextCardsDemo from "../../examples/context-cards/default";
import contextCardsSource from "../../examples/context-cards/default?raw";
import DiffTableDemo from "../../examples/diff-table/default";
import diffTableSource from "../../examples/diff-table/default?raw";
import RecommendationDemo from "../../examples/recommendation-card/default";
import recommendationSource from "../../examples/recommendation-card/default?raw";
import ThinkingDemo from "../../examples/thinking/default";
import thinkingSource from "../../examples/thinking/default?raw";
import ToolChipsDemo from "../../examples/tool-chips/default";
import toolsSource from "../../examples/tool-chips/default?raw";
import { API as approvalApi } from "../../generated/catalog-api/approval-card";
import { API as contextCardsApi } from "../../generated/catalog-api/context-cards";
import { API as diffTableApi } from "../../generated/catalog-api/diff-table";
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
	"diff-table": {
		docs: {
			description:
				"Proposed additions and removals with per-row selection, explicit asynchronous apply and retry. Text labels and checkboxes retain meaning without color; the component never mutates business data.",
			usage:
				'import { DiffTable } from "@nocoo/basalt/components/diff-table";\nexport default function Example() { return <DiffTable columns={[{ id: "name", label: "Name" }]} rows={[{ id: "new", label: "Pistachio", change: "add", values: { name: "Pistachio" } }]} onApply={console.log} />; }',
			variants: [],
			api: diffTableApi,
		},
		examples: [
			{
				id: "diff-table-default",
				title: "Review and apply proposed changes",
				code: diffTableSource,
				render: () => <DiffTableDemo />,
			},
		],
	},
	"context-cards": {
		docs: {
			description:
				"Retrieved context snippets with source badges, character counts, safe optional links and loading, empty, error states. CSS-only staggered entry respects reduced motion.",
			usage:
				'import { ContextCards } from "@nocoo/basalt/components/context-cards";\nexport default function Example() { return <ContextCards chunks={[{ id: "sop", title: "Onboarding", body: "Verify cold-chain certification.", source: { name: "Onboarding.pdf", type: "PDF" } }]} />; }',
			variants: [],
			api: contextCardsApi,
		},
		examples: [
			{
				id: "context-cards-default",
				title: "Retrieved context and states",
				code: contextCardsSource,
				render: () => <ContextCardsDemo />,
			},
		],
	},
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
