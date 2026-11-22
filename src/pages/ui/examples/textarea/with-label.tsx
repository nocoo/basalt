import { Field } from "@nocoo/basalt/components/field";
import { Textarea } from "@nocoo/basalt/components/textarea";
import { useId } from "react";

export default function TextareaWithLabel() {
	const id = useId();
	return (
		<Field label="Notes" htmlFor={id}>
			<Textarea id={id} />
		</Field>
	);
}
