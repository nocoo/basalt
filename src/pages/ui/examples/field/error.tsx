import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";

export default function FieldError() {
	return (
		<Field label="Email" htmlFor="field-error-email" error="Required">
			<Input id="field-error-email" />
		</Field>
	);
}
