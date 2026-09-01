import { Button } from "@nocoo/basalt/components/button";
import { Combobox } from "@nocoo/basalt/components/combobox";
import { Field } from "@nocoo/basalt/components/field";
import { useState } from "react";

export default function ComboboxControlledAndError() {
	const [value, setValue] = useState("");
	return (
		<div className="flex w-full flex-col gap-3">
			<Field label="Fruit" error={value ? undefined : "Pick a fruit"}>
				<Combobox
					items={[
						{ value: "apple", label: "Apple" },
						{ value: "banana", label: "Banana" },
					]}
					value={value}
					onValueChange={setValue}
					placeholder="Select…"
				/>
			</Field>
			<Button type="button" onClick={() => setValue("")}>
				Reset
			</Button>
		</div>
	);
}
