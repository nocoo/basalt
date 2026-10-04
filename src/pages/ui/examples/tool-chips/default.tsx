import { Button } from "@nocoo/basalt/components/button";
import { ToolChips } from "@nocoo/basalt/components/tool-chips";
import { useAgentFeedbackDemo } from "@/viewmodels/useAgentFeedbackDemo";

export default function ToolChipsDemo() {
	const vm = useAgentFeedbackDemo();
	return (
		<div className="w-full space-y-4">
			<ToolChips
				steps={vm.tools}
				diffs={[
					{
						file: "flavors.css",
						added: 13,
						removed: 0,
						content: ".scoop-card {\n-  gap: 14px;\n+  gap: 12px;\n}",
					},
					{ file: "ChurnSchedule.tsx", added: 74, removed: 41 },
				]}
			/>
			<Button variant="outline" size="sm" onClick={vm.restart}>
				Replay tools
			</Button>
		</div>
	);
}
