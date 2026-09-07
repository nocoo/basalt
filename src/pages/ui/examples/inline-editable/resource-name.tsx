import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { InlineEditable } from "@nocoo/basalt/components/inline-editable";
import { useEffect, useId, useRef, useState } from "react";

export default function EditableResourceName() {
	const [name, setName] = useState("Design resources");
	const [fail, setFail] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const id = useId();
	useEffect(() => () => clearTimeout(timer.current), []);
	return (
		<div className="w-full max-w-xl space-y-4">
			<p className="text-xs text-basalt-muted-foreground">
				Resource name · Enter or blur to save · Escape to cancel
			</p>
			<span className="flex items-center gap-2">
				<Checkbox id={id} checked={fail} onCheckedChange={(checked) => setFail(checked === true)} />
				<label htmlFor={id} className="text-xs">
					Fail save request
				</label>
			</span>
			<InlineEditable
				label="Resource name"
				value={name}
				onSave={(next) =>
					new Promise<void>((resolve, reject) => {
						timer.current = setTimeout(() => {
							if (fail) reject(new Error("Could not reach the workspace. Try saving again."));
							else {
								setName(next);
								resolve();
							}
						}, 500);
					})
				}
			/>

			<p role="status" className="text-sm text-basalt-muted-foreground">
				Saved name: {name}
			</p>
		</div>
	);
}
