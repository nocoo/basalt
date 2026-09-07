import { Field } from "@nocoo/basalt/components/field";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { useId } from "react";

export default function InputAreaWithLabel() {
	const id = useId();
	return (
		<Field label="Notes" htmlFor={id}>
			<InputArea id={id} />
		</Field>
	);
}
