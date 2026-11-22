import { Field } from "@nocoo/basalt/components/field";
import { Textarea } from "@nocoo/basalt/components/textarea";
import { useId } from "react";

export default function TextareaErrorStateString() {
	const id = useId();
	return (
		<Field label="Bio" htmlFor={id} error="Too short">
			<Textarea id={id} />
		</Field>
	);
}
