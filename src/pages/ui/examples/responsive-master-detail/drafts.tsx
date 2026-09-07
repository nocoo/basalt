import { Button } from "@nocoo/basalt/components/button";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { ResponsiveMasterDetail } from "@nocoo/basalt/components/responsive-master-detail";
import { useState } from "react";

export default function DraftMasterDetail() {
	const [drafts, setDrafts] = useState<Record<string, string>>({
		Introduction: "Welcome to the project.\n\nKeep notes close to your work.",
		Checklist: "Review the interface\nVerify keyboard access\nPublish the release notes",
	});
	const [selected, setSelected] = useState("Introduction");
	const [open, setOpen] = useState(false);
	return (
		<ResponsiveMasterDetail
			label="Draft workspace"
			selectedId={selected}
			detailOpen={open}
			onDetailOpenChange={setOpen}
			listLabel="Drafts"
			detailLabel="Draft editor"
			backLabel="Back to drafts"
			list={
				<div className="space-y-2 p-3">
					<h3 className="text-sm font-medium">Drafts</h3>
					{Object.keys(drafts).map((name) => (
						<Button
							key={name}
							className="w-full justify-start"
							variant="ghost"
							onClick={() => {
								setSelected(name);
								setOpen(true);
							}}
						>
							{name}
						</Button>
					))}
				</div>
			}
		>
			<div className="space-y-4 p-4">
				<h3 className="font-medium">{selected}</h3>
				<InputArea
					aria-label="Draft text"
					className="min-h-40"
					value={drafts[selected]}
					onChange={(event) => setDrafts({ ...drafts, [selected]: event.target.value })}
				/>
				<p className="text-xs text-basalt-muted-foreground">Preview</p>
				<p className="whitespace-pre-wrap break-words text-sm">{drafts[selected]}</p>
				<p role="status" className="text-xs text-basalt-muted-foreground">
					{drafts[selected].length} characters · local draft retained when returning to the list
				</p>
			</div>
		</ResponsiveMasterDetail>
	);
}
