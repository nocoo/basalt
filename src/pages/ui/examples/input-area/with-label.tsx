import { Field } from "@nocoo/basalt/components/field";
import { InputArea } from "@nocoo/basalt/components/input-area";

export default function InputAreaWithLabel() {
	return (
		<Field label="Notes" htmlFor="ex-notes">
			<InputArea id="ex-notes" />
		</Field>
	);
}
