import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";

export default function FieldRichLabelAndOptional() {
	return (
		<Field
			label={<span>Workspace name</span>}
			hint={<span>Shown on invoices</span>}
			required={false}
			labelTooltip="Used in billing"
		>
			<Input />
		</Field>
	);
}
