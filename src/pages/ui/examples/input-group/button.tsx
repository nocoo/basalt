import { InputGroup } from "@nocoo/basalt/components/input-group";
import { Search } from "lucide-react";

export default function InputGroupButton() {
	return (
		<InputGroup className="max-w-sm">
			<InputGroup.Input aria-label="Query" placeholder="Search" />
			<InputGroup.Addon align="end">
				<InputGroup.Button icon={<Search />} aria-label="Search" />
			</InputGroup.Addon>
		</InputGroup>
	);
}
