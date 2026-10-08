import { IconPicker } from "@nocoo/basalt/components/icon-picker";
import { BookOpen, Code2, Folder, Palette } from "lucide-react";
import { useState } from "react";

export default function FolderIconSelection() {
	const [icon, setIcon] = useState("care plan");
	return (
		<div className="space-y-basalt-space-lg">
			<h3 className="font-medium">Folder appearance</h3>
			<IconPicker
				label="Care plan icon"
				value={icon}
				onValueChange={setIcon}
				options={[
					{ value: "care plan", label: "Care plan", icon: <Folder /> },
					{ value: "book", label: "Book", icon: <BookOpen /> },
					{ value: "code", label: "Code", icon: <Code2 /> },
					{ value: "palette", label: "Palette", icon: <Palette /> },
				]}
			/>
			<p role="status" className="text-basalt-base text-basalt-muted-foreground">
				Selected icon: {icon}
			</p>
		</div>
	);
}
