import { Autocomplete } from "@nocoo/basalt/components/autocomplete";
import { Button } from "@nocoo/basalt/components/button";
import { Field } from "@nocoo/basalt/components/field";
import { useState } from "react";

export default function AutocompleteControlledAndReset() {
	const [value, setValue] = useState("Ada");
	return (
		<div className="flex w-full flex-col gap-3">
			<Field label="Name">
				<Autocomplete
					items={[
						{ value: "ada", label: "Ada" },
						{ value: "grace", label: "Grace" },
					]}
					value={value}
					onValueChange={setValue}
					placeholder="Search names"
				/>
			</Field>
			<Button type="button" onClick={() => setValue("Ada")}>
				Reset
			</Button>
		</div>
	);
}
