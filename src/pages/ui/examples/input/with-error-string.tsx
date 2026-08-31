import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";

export default function InputWithErrorString() {
	return (
		<Field label="Email" htmlFor="ex-input-err" error="Required">
			<Input id="ex-input-err" />
		</Field>
	);
}
