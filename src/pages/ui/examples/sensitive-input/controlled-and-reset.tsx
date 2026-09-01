import { Button } from "@nocoo/basalt/components/button";
import { Field } from "@nocoo/basalt/components/field";
import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";
import { useState } from "react";

export default function SensitiveInputControlledAndReset() {
	const [value, setValue] = useState("Ada");
	return (
		<div className="flex w-full flex-col gap-3">
			<Field label="Password">
				<SensitiveInput
					value={value}
					onChange={(event) => setValue(event.target.value)}
					revealLabel="Show"
					hideLabel="Hide"
				/>
			</Field>
			<Button type="button" onClick={() => setValue("Ada")}>
				Reset
			</Button>
		</div>
	);
}
