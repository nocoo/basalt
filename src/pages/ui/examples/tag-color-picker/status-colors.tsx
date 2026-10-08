import { TagBadge, type TagColor } from "@nocoo/basalt/components/tag-badge";
import { TagColorPicker } from "@nocoo/basalt/components/tag-color-picker";
import { useState } from "react";

export default function StatusColors() {
	const [color, setColor] = useState<TagColor>("success");
	const names = { success: "Healthy", warning: "Follow-up", danger: "Urgent" };
	return (
		<div className="w-full space-y-basalt-space-lg">
			<h3 className="font-medium">Care status palette</h3>
			<TagColorPicker
				label="Care status color"
				value={color}
				onValueChange={setColor}
				colors={["success", "warning", "danger"]}
				labels={names}
			/>
			<TagBadge name={names[color as keyof typeof names]} color={color} />
			<p className="text-basalt-sm text-basalt-muted-foreground">
				Names and selected indicators make these choices usable without distinguishing hue.
			</p>
		</div>
	);
}
