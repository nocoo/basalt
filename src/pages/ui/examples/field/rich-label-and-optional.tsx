import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";

export default function FieldRichLabelAndOptional() {
	return (
		<Field
			label={<span>Care team name</span>}
			hint={<span>Shown on care summaries</span>}
			required={false}
			labelTooltip="Used in care coordination"
		>
			<Input />
		</Field>
	);
}
