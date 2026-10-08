import { InlineEditable } from "@nocoo/basalt/components/inline-editable";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useState } from "react";

export default function EditableCaption() {
	const [caption, setCaption] = useState("");
	return (
		<LayerCard className="w-full max-w-xl">
			<LayerCard.Header>
				<h3 className="font-medium">Recording caption</h3>
			</LayerCard.Header>
			<LayerCard.Body className="space-y-basalt-space-lg">
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
				<p className="text-basalt-sm text-basalt-muted-foreground">
					Optional text with explicit save. Moving focus keeps your draft open.
				</p>
				<p role="status" className="text-basalt-base">
					{caption ? `Published caption: ${caption}` : "No caption published."}
				</p>
			</LayerCard.Body>
		</LayerCard>
	);
}
