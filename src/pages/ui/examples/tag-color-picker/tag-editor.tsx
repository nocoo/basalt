import { Input } from "@nocoo/basalt/components/input";
import { TagBadge, type TagColor } from "@nocoo/basalt/components/tag-badge";
import { TagColorPicker } from "@nocoo/basalt/components/tag-color-picker";
import { useState } from "react";

export default function TagEditor() {
	const [name, setName] = useState("Research");
	const [color, setColor] = useState<TagColor>("violet");
	return (
		<div className="w-full space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<Input
					className="max-w-60"
					aria-label="Tag name"
					value={name}
					onChange={(event) => setName(event.target.value)}
				/>
				<TagBadge name={name || "Untitled tag"} color={color} />
			</div>
			<TagColorPicker label="Tag color" value={color} onValueChange={setColor} />
			<p role="status" className="text-xs text-basalt-muted-foreground">
				Color stored by this page: {color}
			</p>
		</div>
	);
}
