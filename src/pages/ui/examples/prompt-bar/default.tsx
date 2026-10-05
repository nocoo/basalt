import { PromptBar } from "@nocoo/basalt/components/prompt-bar";
import { useState } from "react";
export default function PromptDemo() {
	const [model, setModel] = useState("balanced");
	const [reasoning, setReasoning] = useState(true);
	const [search, setSearch] = useState(false);
	return (
		<PromptBar
			models={[
				{ id: "balanced", label: "Balanced" },
				{ id: "fast", label: "Fast" },
			]}
			model={model}
			onModelChange={setModel}
			reasoning={reasoning}
			onReasoningChange={setReasoning}
			webSearch={search}
			onWebSearchChange={setSearch}
			placeholder="Ask anything…"
			onSend={() => undefined}
		/>
	);
}
