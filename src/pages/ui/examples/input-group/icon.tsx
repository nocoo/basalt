import { InputGroup } from "@nocoo/basalt/components/input-group";
import { Search } from "@nocoo/basalt/icons";

export default function InputGroupIcon() {
	return (
		<InputGroup className="max-w-sm">
			<InputGroup.Addon>
				<Search />
			</InputGroup.Addon>
			<InputGroup.Input aria-label="Search" placeholder="Search" />
		</InputGroup>
	);
}
