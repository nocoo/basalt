import { Switch } from "@nocoo/basalt/components/switch";
import { useState } from "react";

export default function SwitchControlledAndError() {
	const [value, setValue] = useState<string[]>(["alpha"]);
	return (
		<Switch.Group
			value={value}
			onValueChange={setValue}
			error={value.length < 2 ? "Turn on at least two" : undefined}
		>
			<Switch.Legend>Alerts</Switch.Legend>
			<Switch.Item value="alpha">Alpha</Switch.Item>
			<Switch.Item value="beta" size="sm">
				Beta
			</Switch.Item>
		</Switch.Group>
	);
}
