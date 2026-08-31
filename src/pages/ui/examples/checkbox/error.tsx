import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Field } from "@nocoo/basalt/components/field";

export default function CheckboxError() {
	return (
		<Field label="Terms" htmlFor="ex-terms" error="Required">
			<Checkbox id="ex-terms" aria-label="Terms" />
		</Field>
	);
}
