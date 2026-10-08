import { Button } from "@nocoo/basalt/components/button";
import { EditableNavItem } from "@nocoo/basalt/components/editable-nav-item";
import { SidebarNav } from "@nocoo/basalt/components/sidebar";
import { Pin } from "lucide-react";
import { useState } from "react";

export default function FolderNavigation() {
	const [folders, setFolders] = useState([
		{ id: "library", name: "Care library", count: 24 },
		{ id: "reading", name: "Resources list", count: 8 },
		{ id: "archive", name: "Archive", count: 102 },
	]);
	const [selected, setSelected] = useState("library");
	const [pinned, setPinned] = useState<string[]>([]);
	return (
		<div className="w-full max-w-md space-y-basalt-space-lg">
			<h3 className="text-basalt-sm font-medium uppercase tracking-wider text-basalt-muted-foreground">
				Care plan folders
			</h3>
			<SidebarNav aria-label="Care plan navigation">
				{folders.map((folder) => (
					<EditableNavItem
						key={folder.id}
						label={folder.name}
						count={folder.count}
						selected={selected === folder.id}
						onSelect={() => setSelected(folder.id)}
						onRename={(name) =>
							setFolders(folders.map((item) => (item.id === folder.id ? { ...item, name } : item)))
						}
						actions={
							<Button
								variant="ghost"
								size="icon"
								aria-label={`Pin ${folder.name}`}
								aria-pressed={pinned.includes(folder.id)}
								onClick={() =>
									setPinned(
										pinned.includes(folder.id)
											? pinned.filter((id) => id !== folder.id)
											: [...pinned, folder.id],
									)
								}
							>
								<Pin />
							</Button>
						}
					/>
				))}
			</SidebarNav>
			<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
				Opened {folders.find((folder) => folder.id === selected)?.name} · {pinned.length} pinned
			</p>
		</div>
	);
}
