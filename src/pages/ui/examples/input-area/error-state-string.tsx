import { Field } from "@nocoo/basalt/components/field";
import { InputArea } from "@nocoo/basalt/components/input-area";

export default function InputAreaErrorStateString() {
	return (
		<Field label="Bio" htmlFor="ex-bio" error="Too short">
			<InputArea id="ex-bio" />
		</Field>
	);
}
