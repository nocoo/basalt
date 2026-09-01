import { Label } from "@nocoo/basalt/components/label";
import { Radio } from "@nocoo/basalt/components/radio";
import { useState } from "react";

export default function RadioControlledAndError() {
	const [value, setValue] = useState("");
	return (
		<Radio.Group value={value} onValueChange={setValue} error={value ? undefined : "Pick a plan"}>
			<Radio.Legend>Plan</Radio.Legend>
			<Label className="flex items-center gap-2">
				<Radio.Item value="a" /> Alpha
			</Label>
			<Label className="flex items-center gap-2">
				<Radio.Item value="b" size="sm" /> Beta
			</Label>
		</Radio.Group>
	);
}
