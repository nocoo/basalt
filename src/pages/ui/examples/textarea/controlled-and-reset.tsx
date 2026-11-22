import { Button } from "@nocoo/basalt/components/button";
import { Field } from "@nocoo/basalt/components/field";
import { Textarea } from "@nocoo/basalt/components/textarea";
import { useState } from "react";

export default function TextareaControlledAndReset() {
	const [value, setValue] = useState("Ada");
	return (
		<div className="flex w-full flex-col gap-basalt-space-lg">
			<Field label="Notes">
				<Textarea value={value} onChange={(event) => setValue(event.target.value)} />
			</Field>
			<Button type="button" onClick={() => setValue("Ada")}>
				Reset
			</Button>
		</div>
	);
}
