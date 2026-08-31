import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";

export default function InputWithLabelAndDescription() {
	return (
		<Field label="Email" htmlFor="ex-input-email" hint="Never shared">
			<Input id="ex-input-email" placeholder="you@example.com" />
		</Field>
	);
}
