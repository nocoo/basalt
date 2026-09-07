import { Button } from "@nocoo/basalt/components/button";
import { InlineEditable } from "@nocoo/basalt/components/inline-editable";
import { ResponsiveMasterDetail } from "@nocoo/basalt/components/responsive-master-detail";
import { TagBadge } from "@nocoo/basalt/components/tag-badge";
import { useState } from "react";

export default function ResourceMasterDetail() {
	const [resources, setResources] = useState([
		{
			id: "research",
			name: "Research collection",
			description: "Papers, interviews and observations.",
		},
		{
			id: "design",
			name: "Design collection",
			description: "Patterns, components and accessibility notes.",
		},
		{
			id: "engineering",
			name: "Engineering collection",
			description: "Architecture decisions and release checklists.",
		},
	]);
	const [selected, setSelected] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const item = resources.find((item) => item.id === selected);
	return (
		<ResponsiveMasterDetail
			label="Resource browser"
			detailOpen={open}
			onDetailOpenChange={setOpen}
			selectedId={selected}
			listLabel="Collections"
			detailLabel="Collection details"
			list={
				<div className="space-y-1 p-3">
					<h3 className="mb-3 px-2 text-sm font-medium">Collections</h3>
					{resources.map((resource) => (
						<Button
							key={resource.id}
							variant={resource.id === selected ? "secondary" : "ghost"}
							className="w-full justify-start"
							onClick={() => {
								setSelected(resource.id);
								setOpen(true);
							}}
						>
							{resource.name}
						</Button>
					))}
				</div>
			}
		>
			{item && (
				<div className="space-y-4 p-5">
					<TagBadge name={item.id} colorKey={item.id} />
					<InlineEditable
						key={item.id}
						label="Collection title"
						value={item.name}
						onSave={(name) =>
							setResources(resources.map((row) => (row.id === item.id ? { ...row, name } : row)))
						}
					/>
					<p className="text-sm text-basalt-muted-foreground">{item.description}</p>
					<p className="text-xs text-basalt-muted-foreground">
						On mobile, Back returns focus to the collection you opened.
					</p>
				</div>
			)}
		</ResponsiveMasterDetail>
	);
}
