import { Button } from "@nocoo/basalt/components/button";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { Thinking, type ThinkingVariant } from "@nocoo/basalt/components/thinking";
import { useState } from "react";
import { useAgentFeedbackDemo } from "@/viewmodels/useAgentFeedbackDemo";

export default function ThinkingDemo() {
	const [variant, setVariant] = useState<ThinkingVariant>("steps");
	const vm = useAgentFeedbackDemo(variant);
	return (
		<div className="w-full space-y-basalt-space-lg">
			<Thinking steps={vm.steps} variant={variant} />
			<SegmentControl
				legend="Trace style"
				value={variant}
				onValueChange={(value) => setVariant(value as ThinkingVariant)}
				options={["steps", "reasoning", "search", "coding"].map((value) => ({
					value,
					label: value,
				}))}
			/>
			<Button variant="outline" size="sm" onClick={vm.restart}>
				Replay trace
			</Button>
		</div>
	);
}
