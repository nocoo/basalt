import { InputGroup } from "@nocoo/basalt/components/input-group";
import { CircleCheck } from "@nocoo/basalt/icons";

export default function InputGroupInlineSuffix() {
	return (
		<InputGroup className="max-w-sm">
			<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
			<InputGroup.Suffix>.example.com</InputGroup.Suffix>
			<InputGroup.Addon align="end">
				<CircleCheck className="text-basalt-success" />
			</InputGroup.Addon>
		</InputGroup>
	);
}
