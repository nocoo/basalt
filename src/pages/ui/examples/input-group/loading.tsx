import { InputGroup } from "@nocoo/basalt/components/input-group";
import { Loader } from "@nocoo/basalt/components/loader";

export default function InputGroupLoading() {
	return (
		<InputGroup className="max-w-sm">
			<InputGroup.Input defaultValue="atlas" aria-label="Loading query" />
			<InputGroup.Addon align="end">
				<Loader size={16} />
			</InputGroup.Addon>
		</InputGroup>
	);
}
