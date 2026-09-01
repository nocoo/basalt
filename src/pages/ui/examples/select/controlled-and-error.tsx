import { Button } from "@nocoo/basalt/components/button";
import { Field } from "@nocoo/basalt/components/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { useState } from "react";

export default function SelectControlledAndError() {
	const [value, setValue] = useState("");
	return (
		<div className="flex w-full flex-col gap-3">
			<Select value={value} onValueChange={setValue}>
				<Field label="Version" error={value ? undefined : "Pick a version"}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="Choose…" />
					</SelectTrigger>
				</Field>
				<SelectContent>
					<SelectItem value="1">v1</SelectItem>
					<SelectItem value="2">v2</SelectItem>
				</SelectContent>
			</Select>
			<Button type="button" onClick={() => setValue("")}>
				Reset
			</Button>
		</div>
	);
}
