import { Checkbox } from "@nocoo/basalt/components/checkbox";

export default function CheckboxGroupAndLegend() {
	return (
		<Checkbox.Group defaultValue={["alpha"]}>
			<Checkbox.Legend>Topics</Checkbox.Legend>
			<Checkbox.Item value="alpha">Alpha</Checkbox.Item>
			<Checkbox.Item value="beta">Beta</Checkbox.Item>
		</Checkbox.Group>
	);
}
