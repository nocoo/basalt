import { InlineEditable } from "@nocoo/basalt/components/inline-editable";
import { useState } from "react";

export default function EditableCaption() {
	const [caption, setCaption] = useState("");
	return (
		<div className="w-full max-w-xl space-y-3 rounded-basalt-lg border border-basalt-border p-5">
			<h3 className="font-medium">Recording caption</h3>
			<InlineEditable
				label="Recording caption"
				value={caption}
				onSave={setCaption}
				placeholder="Add an optional caption"
				required={false}
				trim={false}
				saveOnBlur={false}
				validate={(value) =>
					value.length > 80 ? "Keep the caption under 80 characters." : undefined
				}
			/>
			<p className="text-xs text-basalt-muted-foreground">
				Optional text with explicit save. Moving focus keeps your draft open.
			</p>
			<p role="status" className="text-sm">
				{caption ? `Published caption: ${caption}` : "No caption published."}
			</p>
		</div>
	);
}
