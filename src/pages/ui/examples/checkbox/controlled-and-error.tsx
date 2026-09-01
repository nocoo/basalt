import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { useState } from "react";

export default function CheckboxControlledAndError() {
	const [value, setValue] = useState<string[]>(["alpha"]);
	return (
		<Checkbox.Group
			value={value}
			onValueChange={setValue}
			error={value.length < 2 ? "Pick at least two" : undefined}
		>
			<Checkbox.Legend>Topics</Checkbox.Legend>
			<Checkbox.Item value="alpha">Alpha</Checkbox.Item>
			<Checkbox.Item value="beta" size="sm">
				Beta
			</Checkbox.Item>
		</Checkbox.Group>
	);
}
