import { EditableNavItem } from "@nocoo/basalt/components/editable-nav-item";
import { TagBadge } from "@nocoo/basalt/components/tag-badge";
import { ChartNoAxesCombined, Search } from "lucide-react";
import { useState } from "react";

export default function SavedViewNavigation() {
	const [name, setName] = useState("High usage devices");
	const [selected, setSelected] = useState("usage");
	return (
		<div className="w-full max-w-md space-y-3">
			<h3 className="font-medium">Saved analytics views</h3>
			<nav aria-label="Saved views" className="space-y-1">
				<EditableNavItem
					label={name}
					icon={<ChartNoAxesCombined className="size-4" />}
					selected={selected === "usage"}
					onSelect={() => setSelected("usage")}
					onRename={(next) => {
						if (next.length < 4) throw new Error("Use at least four characters.");
						setName(next);
					}}
					count={<TagBadge name="Live" color="success" size="sm" />}
				/>
				<EditableNavItem
					label="Search all records"
					icon={<Search className="size-4" />}
					selected={selected === "search"}
					onSelect={() => setSelected("search")}
				/>
				<EditableNavItem label="Restricted workspace" disabled />
			</nav>
			<p role="status" className="text-xs text-basalt-muted-foreground">
				{selected === "usage" ? name : "Search all records"}
			</p>
		</div>
	);
}
