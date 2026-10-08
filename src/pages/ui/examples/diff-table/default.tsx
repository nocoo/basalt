import { Button } from "@nocoo/basalt/components/button";
import { DiffTable, type DiffTableRow } from "@nocoo/basalt/components/diff-table";
import { Switch } from "@nocoo/basalt/components/switch";
import { useId, useState } from "react";

const rows: DiffTableRow[] = [
	{
		id: "rocky",
		label: "Rocky Road",
		change: "remove",
		values: { flavor: "Rocky Road", category: "Classic", supplier: "aurora-scoops" },
	},
	{
		id: "bubblegum",
		label: "Bubblegum",
		change: "remove",
		values: { flavor: "Bubblegum", category: "Retro", supplier: "northstar-creamery" },
	},
	{
		id: "mint",
		label: "Mint Chip",
		change: "unchanged",
		values: { flavor: "Mint Chip", category: "Classic", supplier: "maple-orbit" },
	},
	{
		id: "pistachio",
		label: "Pistachio",
		change: "add",
		values: { flavor: "Pistachio", category: "Seasonal", supplier: "maple-orbit" },
	},
];
export default function DiffTableDemo() {
	const [run, setRun] = useState(0);
	const id = useId();
	const [fail, setFail] = useState(false);
	return (
		<div className="w-full space-y-basalt-space-lg">
			<DiffTable
				key={run}
				title="Proposed menu cleanup"
				rows={rows}
				columns={[
					{ id: "flavor", label: "Flavor" },
					{ id: "category", label: "Category" },
					{ id: "supplier", label: "Supplier" },
				]}
				onApply={async () => {
					if (fail) throw new Error("Could not apply changes. Retry when ready.");
				}}
			/>
			<div className="flex flex-wrap items-center gap-basalt-space-lg">
				<Button variant="outline" size="sm" onClick={() => setRun(run + 1)}>
					Reset changes
				</Button>
				<label htmlFor={id} className="inline-flex items-center gap-basalt-space-lg text-basalt-sm">
					<Switch id={id} size="sm" checked={fail} onCheckedChange={setFail} />
					Simulate failure
				</label>
			</div>
		</div>
	);
}
