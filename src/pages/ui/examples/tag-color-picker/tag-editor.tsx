import { Input } from "@nocoo/basalt/components/input";
import { TagBadge, type TagColor } from "@nocoo/basalt/components/tag-badge";
import { TagColorPicker } from "@nocoo/basalt/components/tag-color-picker";
import { useState } from "react";

export default function TagEditor() {
	const [name, setName] = useState("Care plan");
	const [color, setColor] = useState<TagColor>("violet");
	return (
		<div className="w-full space-y-basalt-layout">
			<div className="flex flex-wrap items-center gap-basalt-space-lg">
				<Input
					className="max-w-60"
					aria-label="Tag name"
					value={name}
					onChange={(event) => setName(event.target.value)}
				/>
				<TagBadge name={name || "Untitled tag"} color={color} />
			</div>
			<div className="space-y-basalt-space-lg">
				<p className="text-basalt-sm font-medium">Label color</p>
				<TagColorPicker label="Tag color" value={color} onValueChange={setColor} />
			</div>
			<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
				Your care label uses the {color} palette.
			</p>
		</div>
	);
}
