import { Flow, FlowNode } from "@nocoo/basalt/components/flow";

export default function FlowSequentialFlow() {
	return (
		<Flow>
			<FlowNode>Step 1</FlowNode>
			<FlowNode>Step 2</FlowNode>
		</Flow>
	);
}
