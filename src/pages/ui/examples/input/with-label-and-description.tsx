import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { useId } from "react";

export default function InputWithLabelAndDescription() {
	const id = useId();
	return (
		<Field label="Email" htmlFor={id} hint="Never shared">
			<Input id={id} placeholder="you@example.com" />
		</Field>
	);
}
