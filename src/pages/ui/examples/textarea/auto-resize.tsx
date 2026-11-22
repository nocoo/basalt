import { Field } from "@nocoo/basalt/components/field";
import { Textarea } from "@nocoo/basalt/components/textarea";
import { useId } from "react";

export default function TextareaAutoResize() {
	const id = useId();
	return (
		<Field label="Auto-resizing notes" htmlFor={id} hint="Grows up to 5 rows as you type.">
			<Textarea
				id={id}
				autoResize
				maxRows={5}
				defaultValue={"First line of clinical notes\nSecond line of follow-up guidance"}
			/>
		</Field>
	);
}
