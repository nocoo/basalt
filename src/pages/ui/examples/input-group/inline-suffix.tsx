import { InputGroup } from "@nocoo/basalt/components/input-group";
import { CircleCheck } from "lucide-react";

export default function InputGroupInlineSuffix() {
	return (
		<InputGroup className="max-w-sm">
			<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
			<InputGroup.Suffix>.example.com</InputGroup.Suffix>
			<InputGroup.Addon align="end">
				<CircleCheck className="text-basalt-heatmap-green-3" />
			</InputGroup.Addon>
		</InputGroup>
	);
}
