import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";

export default function FieldHint() {
	return (
		<Field label="Email" htmlFor="field-hint-email" hint="Never shared">
			<Input id="field-hint-email" />
		</Field>
	);
}
