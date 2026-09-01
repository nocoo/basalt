import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";

export default function FieldStructuredError() {
	return (
		<Field label="Email" error={{ message: <span>Enter a valid email</span> }}>
			<Input />
		</Field>
	);
}
