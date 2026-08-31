import { InputGroup } from "@nocoo/basalt/components/input-group";

export default function InputGroupText() {
	return (
		<InputGroup className="max-w-sm">
			<InputGroup.Addon>https://</InputGroup.Addon>
			<InputGroup.Input aria-label="Host" placeholder="example.com" />
		</InputGroup>
	);
}
