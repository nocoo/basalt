import { Button } from "@nocoo/basalt/components/button";
import { FolderNavItem } from "@nocoo/basalt/components/editable-nav-item";
import { Pin } from "lucide-react";
import { useState } from "react";

export default function FolderNavigation() {
	const [folders, setFolders] = useState([
		{ id: "library", name: "Library", count: 24 },
		{ id: "reading", name: "Reading list", count: 8 },
		{ id: "archive", name: "Archive", count: 102 },
	]);
	const [selected, setSelected] = useState("library");
	const [pinned, setPinned] = useState<string[]>([]);
	return (
		<div className="w-full max-w-md space-y-3">
			<h3 className="text-xs font-medium uppercase tracking-wider text-basalt-muted-foreground">
				Workspace folders
			</h3>
			<nav aria-label="Folder navigation" className="space-y-1">
				{folders.map((folder) => (
					<FolderNavItem
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
			</nav>
			<p role="status" className="text-xs text-basalt-muted-foreground">
				Opened {folders.find((folder) => folder.id === selected)?.name} · {pinned.length} pinned
			</p>
		</div>
	);
}
