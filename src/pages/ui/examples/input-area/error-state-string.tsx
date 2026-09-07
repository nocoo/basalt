import { Field } from "@nocoo/basalt/components/field";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { useId } from "react";

export default function InputAreaErrorStateString() {
	const id = useId();
	return (
		<Field label="Bio" htmlFor={id} error="Too short">
			<InputArea id={id} />
		</Field>
	);
}
