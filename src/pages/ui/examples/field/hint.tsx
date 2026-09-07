import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { useId } from "react";

export default function FieldHint() {
	const id = useId();
	return (
		<Field label="Email" htmlFor={id} hint="Never shared">
			<Input id={id} />
		</Field>
	);
}
