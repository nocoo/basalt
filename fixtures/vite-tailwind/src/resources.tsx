import "./index.css";
import { BatteryMeter } from "@nocoo/basalt/components/battery-meter";
import { Button } from "@nocoo/basalt/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableSort,
} from "@nocoo/basalt/components/data-table";
import { ResourceList } from "@nocoo/basalt/components/resource-list";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const rows = [
	{ id: "a", name: "Atlas", charge: 100 },
	{ id: "b", name: "Boreal", charge: 42 },
	{ id: "c", name: "Cedar", charge: 0 },
	{ id: "d", name: "Delta", charge: 14 },
	{ id: "e", name: "Ember", charge: 88 },
];
const columns: DataTableColumn<(typeof rows)[number]>[] = [
	{ id: "name", header: "Name", width: 280, accessor: (row) => row.name },
	{
		id: "charge",
		header: "Charge",
		width: 280,
		accessor: (row) => <BatteryMeter label={row.name} value={row.charge} />,
	},
	{ id: "status", header: "Status", sortable: false, accessor: () => "Managed" },
];
function ResourceApp() {
	const [page, setPage] = useState(2);
	const [selected, setSelected] = useState<string[]>([]);
	const [sort, setSort] = useState<DataTableSort | null>(null);
	const [mode, setMode] = useState("ready");
	const [retries, setRetries] = useState(0);
	return (
		<main style={{ padding: 16, maxWidth: 1100, margin: "auto" }}>
			<style>{".resource-audit-table { min-width: 760px; }"}</style>
			<ResourceList
				title="Managed devices"
				data={[]}
				toolbar={
					<div className="flex flex-wrap gap-2">
						{["ready", "loading", "empty", "error"].map((value) => (
							<Button key={value} onClick={() => setMode(value)}>
								{value}
							</Button>
						))}
					</div>
				}
				bulkActions={<p data-testid="selected">Selected: {selected.join(",")}</p>}
				footer={
					<p data-testid="requests">
						{sort ? `${sort.id}:${sort.dir}` : "unsorted"} · retries:{retries}
					</p>
				}
			>
				<DataTable
					data={mode === "empty" ? [] : rows.slice((page - 1) * 2, page * 2)}
					columns={columns}
					manualPagination
					manualSorting
					manualFiltering
					total={mode === "empty" ? 0 : rows.length}
					pageSize={2}
					page={page}
					onPageChange={setPage}
					sort={sort}
					onSortChange={setSort}
					selected={selected}
					onSelectedChange={setSelected}
					multiple
					filter="server-only-query"
					className="resource-audit-table"
					aria-label="Managed devices"
					loading={mode === "loading"}
					error={mode === "error" ? "Inventory failed" : undefined}
					onRetry={() => {
						setRetries((n) => n + 1);
						setMode("ready");
					}}
				/>
			</ResourceList>
			<div className="mt-4 flex flex-wrap gap-4">
				<BatteryMeter label="Offline sensor" value={50} status="offline" />
				<BatteryMeter label="Charging sensor" value={51} status="charging" />
			</div>
		</main>
	);
}
const root = document.getElementById("resources-root");
if (!root) throw new Error("resources-root missing");
createRoot(root).render(<ResourceApp />);
