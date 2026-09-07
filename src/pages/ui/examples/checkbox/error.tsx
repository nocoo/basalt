import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Field } from "@nocoo/basalt/components/field";
import { useId } from "react";

export default function CheckboxError() {
	const id = useId();
	return (
		<Field label="Terms" htmlFor={id} error="Required">
			<Checkbox id={id} aria-label="Terms" />
		</Field>
	);
}
