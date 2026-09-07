import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { useId } from "react";

export default function InputWithErrorString() {
	const id = useId();
	return (
		<Field label="Email" htmlFor={id} error="Required">
			<Input id={id} />
		</Field>
	);
}
