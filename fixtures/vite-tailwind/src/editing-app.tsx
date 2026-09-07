import { Button } from "@nocoo/basalt/components/button";
import { EditableNavItem, FolderNavItem } from "@nocoo/basalt/components/editable-nav-item";
import { IconPicker } from "@nocoo/basalt/components/icon-picker";
import { InlineEditable } from "@nocoo/basalt/components/inline-editable";
import { Input } from "@nocoo/basalt/components/input";
import { ResponsiveMasterDetail } from "@nocoo/basalt/components/responsive-master-detail";
import { TAG_COLORS, TagBadge, type TagColor } from "@nocoo/basalt/components/tag-badge";
import { TagColorPicker } from "@nocoo/basalt/components/tag-color-picker";
import { Book, Folder, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const icons = [
	{ value: "folder", label: "Folder", icon: <Folder /> },
	{ value: "locked", label: "Lock", icon: <Lock />, disabled: true },
	{ value: "book", label: "Book", icon: <Book /> },
];
export default function EditingApp() {
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => setHydrated(true), []);
	const [name, setName] = useState("Collection");
	const pending = useRef<{
		next: string;
		resolve: () => void;
		reject: (error: Error) => void;
	} | null>(null);
	const [folder, setFolder] = useState("Research");
	const [selected, setSelected] = useState(false);
	const [pinned, setPinned] = useState(false);
	const [color, setColor] = useState<TagColor>("blue");
	const [items, setItems] = useState(["Alpha", "Beta"]);
	const [opened, setOpened] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	return (
		<main
			data-editing-ready={hydrated}
			style={{ padding: 16, maxWidth: 840, margin: "auto" }}
			className="space-y-6"
		>
			<h1 className="text-xl font-semibold">Editing and navigation</h1>
			<InlineEditable
				label="Collection name"
				value={name}
				onSave={(next) =>
					new Promise<void>((resolve, reject) => {
						pending.current = { next, resolve, reject };
					})
				}
			/>
			<div className="flex flex-wrap gap-2">
				<Button
					onClick={() => {
						const save = pending.current;
						if (save) {
							pending.current = null;
							setName(save.next);
							save.resolve();
						}
					}}
				>
					Complete save
				</Button>
				<Button
					onClick={() => {
						const save = pending.current;
						if (save) {
							pending.current = null;
							save.reject(new Error("Save failed. Retry."));
						}
					}}
				>
					Fail save
				</Button>
				<Button variant="outline">Outside editor</Button>
			</div>
			<p data-testid="saved-name">{name}</p>
			<nav aria-label="Editable folders">
				<FolderNavItem
					label={folder}
					count={24}
					selected={selected}
					onSelect={() => setSelected(true)}
					onRename={setFolder}
					actions={
						<Button
							aria-label="Pin folder"
							aria-pressed={pinned}
							onClick={() => setPinned(!pinned)}
						>
							Pin
						</Button>
					}
				/>
				<EditableNavItem label="Locked folder" href="#locked" disabled onRename={() => {}} />
			</nav>
			<p data-testid="pinned">{String(pinned)}</p>
			<IconPicker label="Folder icon" options={icons} defaultValue="folder" />
			<TagColorPicker label="Tag color" value={color} onValueChange={setColor} />
			<TagBadge data-testid="chosen-tag" name="Chosen tag" color={color} />
			<div data-palette className="flex flex-wrap gap-2">
				{(Object.keys(TAG_COLORS) as TagColor[]).map((color) => (
					<TagBadge key={color} name={TAG_COLORS[color].label} color={color} />
				))}
			</div>
			<ResponsiveMasterDetail
				label="Resource browser"
				listLabel="Resources"
				detailLabel="Resource details"
				detailOpen={open}
				onDetailOpenChange={setOpen}
				selectedId={opened}
				empty={<p className="p-4">Choose a resource.</p>}
				list={
					<div className="space-y-2 p-3">
						{items.map((item) => (
							<Button
								key={item}
								className="w-full"
								onClick={() => {
									setOpened(item);
									setOpen(true);
								}}
							>
								Open {item}
							</Button>
						))}
					</div>
				}
			>
				<div className="space-y-3 p-4">
					<h2>{opened}</h2>
					<Input aria-label="Draft note" defaultValue="" />
					<Button onClick={() => setItems(items.filter((item) => item !== opened))}>
						Remove opened item
					</Button>
					<Button onClick={() => setOpen(false)}>Close details</Button>
				</div>
			</ResponsiveMasterDetail>
		</main>
	);
}
