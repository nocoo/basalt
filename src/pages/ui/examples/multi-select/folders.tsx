import { MultiSelect } from "@nocoo/basalt/components/multi-select";
import { Folder, Lock } from "lucide-react";
import { useState } from "react";

export default function FolderSelection() {
	const [selected, setSelected] = useState(["research", "shared"]);
	return (
		<div className="w-full max-w-md space-y-basalt-space-lg">
			<div>
				<h3 className="font-medium">Organize your library</h3>
				<p className="text-basalt-base text-basalt-muted-foreground">
					Search folders and choose where this resource belongs.
				</p>
			</div>
			<MultiSelect
				label="Care plans"
				name="folders"
				value={selected}
				onValueChange={setSelected}
				options={[
					{
						value: "research",
						label: "Research",
						description: "Papers and reading notes",
						leading: <Folder className="size-4" />,
					},
					{
						value: "design",
						label: "Wellness",
						description: "Interfaces and inspiration",
						leading: <Folder className="size-4" />,
					},
					{
						value: "engineering",
						label: "Engineering",
						description: "Tools and architecture",
						leading: <Folder className="size-4" />,
					},
					{
						value: "shared",
						label: "Team archive",
						description: "Required by your care team",
						leading: <Lock className="size-4" />,
						disabled: true,
					},
				]}
			/>
			<p role="status" className="text-basalt-base text-basalt-muted-foreground">
				Saved in {selected.length} folders. The care archive is required.
			</p>
		</div>
	);
}
