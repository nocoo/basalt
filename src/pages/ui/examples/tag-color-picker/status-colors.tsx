import { TagBadge, type TagColor } from "@nocoo/basalt/components/tag-badge";
import { TagColorPicker } from "@nocoo/basalt/components/tag-color-picker";
import { useState } from "react";

export default function StatusColors() {
	const [color, setColor] = useState<TagColor>("success");
	const names = { success: "Healthy", warning: "Needs attention", danger: "Incident" };
	return (
		<div className="w-full space-y-4">
			<h3 className="font-medium">Service status palette</h3>
			<TagColorPicker
				label="Service status color"
				value={color}
				onValueChange={setColor}
				colors={["success", "warning", "danger"]}
				labels={names}
			/>
			<TagBadge name={names[color as keyof typeof names]} color={color} />
			<p className="text-xs text-basalt-muted-foreground">
				Names and selected indicators make these choices usable without distinguishing hue.
			</p>
		</div>
	);
}
