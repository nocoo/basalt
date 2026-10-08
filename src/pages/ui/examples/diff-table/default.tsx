import { Button } from "@nocoo/basalt/components/button";
import { DiffTable, type DiffTableRow } from "@nocoo/basalt/components/diff-table";
import { Switch } from "@nocoo/basalt/components/switch";
import { useId, useState } from "react";

const rows: DiffTableRow[] = [
	{
		id: "rocky",
		label: "Blood pressure",
		change: "remove",
		values: { flavor: "Blood pressure", category: "Cardiometabolic", supplier: "harbor-clinic" },
	},
	{
		id: "bubblegum",
		label: "Sleep duration",
		change: "remove",
		values: { flavor: "Sleep duration", category: "Sleep", supplier: "northstar-clinic" },
	},
	{
		id: "mint",
		label: "Daily steps",
		change: "unchanged",
		values: { flavor: "Daily steps", category: "Cardiometabolic", supplier: "harbor-clinic" },
	},
	{
		id: "pistachio",
		label: "Activity level",
		change: "add",
		values: { flavor: "Activity level", category: "Wellness", supplier: "harbor-clinic" },
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
				title="Proposed care record update"
				rows={rows}
				columns={[
					{ id: "flavor", label: "Care metric" },
					{ id: "category", label: "Category" },
					{ id: "supplier", label: "Care team" },
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
