import { Button } from "@nocoo/basalt/components/button";
import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { useState } from "react";

export default function InputControlledAndReset() {
	const [value, setValue] = useState("Ada");
	return (
		<div className="flex w-full flex-col gap-3">
			<Field label="Name">
				<Input value={value} onChange={(event) => setValue(event.target.value)} />
			</Field>
			<Button type="button" onClick={() => setValue("Ada")}>
				Reset
			</Button>
		</div>
	);
}
