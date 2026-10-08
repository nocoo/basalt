import { Button } from "@nocoo/basalt/components/button";
import { ToolChips } from "@nocoo/basalt/components/tool-chips";
import { useAgentFeedbackDemo } from "@/viewmodels/useAgentFeedbackDemo";

export default function ToolChipsDemo() {
	const vm = useAgentFeedbackDemo();
	return (
		<div className="w-full space-y-basalt-space-lg">
			<ToolChips
				steps={vm.tools}
				diffs={[
					{
						file: "care-summary.css",
						added: 13,
						removed: 0,
						content: " .care-summary {\n-  gap: 14px;\n+  gap: 12px;\n}",
					},
					{ file: "FollowUpSchedule.tsx", added: 74, removed: 41 },
				]}
			/>
			<Button variant="outline" size="sm" onClick={vm.restart}>
				Replay tools
			</Button>
		</div>
	);
}
