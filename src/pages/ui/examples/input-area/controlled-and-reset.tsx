import { Button } from "@nocoo/basalt/components/button";
import { Field } from "@nocoo/basalt/components/field";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { useState } from "react";

export default function InputAreaControlledAndReset() {
	const [value, setValue] = useState("Ada");
	return (
		<div className="flex w-full flex-col gap-3">
			<Field label="Notes">
				<InputArea value={value} onChange={(event) => setValue(event.target.value)} />
			</Field>
			<Button type="button" onClick={() => setValue("Ada")}>
				Reset
			</Button>
		</div>
	);
}
