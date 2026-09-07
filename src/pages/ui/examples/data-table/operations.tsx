import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { BatteryMeter } from "@nocoo/basalt/components/battery-meter";
import { Button } from "@nocoo/basalt/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableSort,
} from "@nocoo/basalt/components/data-table";
import { Input } from "@nocoo/basalt/components/input";
import { ResourceList } from "@nocoo/basalt/components/resource-list";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

const Sparkline = lazy(() =>
	import("@nocoo/basalt/charts/sparkline").then((module) => ({
		default: module.Sparkline<{ x: number; y: number }>,
	})),
);

const DEVICES = [
	{
		id: "edge-01",
		name: "Atlas gateway",
		region: "US East · Rack A1",
		status: "Online",
		battery: 94,
		requests: 4820,
		updated: "2026-09-07T09:42:00Z",
		trend: [12, 18, 16, 24, 20, 35, 42],
	},
	{
		id: "edge-02",
		name: "Northstar relay",
		region: "EU West · Rack B4",
		status: "Online",
		battery: 67,
		requests: 3612,
		updated: "2026-09-07T09:40:00Z",
		trend: [30, 28, 34, 26, 32, 38, 35],
	},
	{
		id: "edge-03",
		name: "Meridian sensor",
		region: "AP South · Field 12",
		status: "Warning",
		battery: 14,
		requests: 920,
		updated: "2026-09-07T09:38:00Z",
		trend: [38, 34, 29, 24, 18, 12, 9],
	},
	{
		id: "edge-04",
		name: "Orbit bridge",
		region: "US West · Rack C2",
		status: "Offline",
		battery: 0,
		requests: 0,
		updated: "2026-09-06T22:15:00Z",
		trend: [24, 21, 12, 0, 0, 0, 0],
	},
	{
		id: "edge-05",
		name: "Summit beacon",
		region: "EU Central · Field 8",
		status: "Online",
		battery: 42,
		requests: 2841,
		updated: "2026-09-07T09:35:00Z",
		trend: [8, 12, 11, 18, 21, 26, 28],
	},
	{
		id: "edge-06",
		name: "Harbor gateway",
		region: "AP East · Rack D1",
		status: "Online",
		battery: 88,
		requests: 5940,
		updated: "2026-09-07T09:33:00Z",
		trend: [42, 38, 44, 48, 51, 58, 59],
	},
	{
		id: "edge-07",
		name: "Cedar relay",
		region: "US East · Rack A3",
		status: "Warning",
		battery: 19,
		requests: 1548,
		updated: "2026-09-07T09:31:00Z",
		trend: [26, 22, 24, 18, 16, 17, 15],
	},
	{
		id: "edge-08",
		name: "Lumen sensor",
		region: "EU West · Field 6",
		status: "Online",
		battery: 76,
		requests: 4126,
		updated: "2026-09-07T09:29:00Z",
		trend: [22, 28, 25, 31, 38, 36, 41],
	},
];
type Device = (typeof DEVICES)[number];
type Mode = "ready" | "loading" | "empty" | "error";
const count = new Intl.NumberFormat("en-US");
const updated = new Intl.DateTimeFormat("en-GB", {
	month: "short",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit",
	timeZone: "UTC",
});

export default function OperationsTable() {
	const [inventory, setInventory] = useState(DEVICES);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState("All states");
	const [sort, setSort] = useState<DataTableSort | null>(null);
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<string[]>([]);
	const [mode, setMode] = useState<Mode>("ready");
	const [result, setResult] = useState<{
		rows: Device[];
		total: number;
		loading: boolean;
		error?: string;
	}>({ rows: [], total: DEVICES.length, loading: true });
	const [notice, setNotice] = useState("");
	useEffect(() => {
		setResult((current) => ({ ...current, loading: true, error: undefined }));
		if (mode === "loading") return;
		const timer = setTimeout(() => {
			if (mode === "error") {
				setResult((current) => ({
					...current,
					loading: false,
					error: "Device inventory is temporarily unavailable.",
				}));
				return;
			}
			const filtered =
				mode === "empty"
					? []
					: inventory.filter(
							(row) =>
								`${row.name} ${row.region}`.toLowerCase().includes(query.trim().toLowerCase()) &&
								(status === "All states" || row.status === status),
						);
			const sorted = [...filtered].sort((a, b) => {
				if (!sort) return 0;
				const key = sort.id as "name" | "status" | "battery" | "requests" | "updated";
				const left = a[key],
					right = b[key];
				const comparison =
					typeof left === "number" && typeof right === "number"
						? left - right
						: String(left).localeCompare(String(right));
				return sort.dir === "asc" ? comparison : -comparison;
			});
			setResult({
				rows: sorted.slice((page - 1) * 4, page * 4),
				total: sorted.length,
				loading: false,
			});
		}, 350);
		return () => clearTimeout(timer);
	}, [inventory, query, status, sort, page, mode]);
	const columns = useMemo<DataTableColumn<Device>[]>(
		() => [
			{
				id: "name",
				header: "Device",
				width: 215,
				accessor: (row) => (
					<div className="flex items-center gap-3">
						<Avatar className="h-9 w-9">
							<AvatarFallback>{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-medium">{row.name}</p>
							<p className="mt-1 text-xs text-basalt-muted-foreground">{row.region}</p>
						</div>
					</div>
				),
				sortValue: (row) => row.name,
			},
			{
				id: "status",
				header: "State",
				width: 104,
				accessor: (row) => (
					<Badge
						dot
						variant={
							row.status === "Online"
								? "success"
								: row.status === "Warning"
									? "warning"
									: "secondary"
						}
					>
						{row.status}
					</Badge>
				),
				sortValue: (row) => row.status,
			},
			{
				id: "battery",
				header: "Battery",
				width: 115,
				accessor: (row) => (
					<BatteryMeter
						value={row.battery}
						label={`${row.name} battery`}
						status={row.status === "Offline" ? "offline" : "discharging"}
					/>
				),
				sortValue: (row) => row.battery,
			},
			{
				id: "requests",
				header: "Requests / hour",
				width: 150,
				accessor: (row) => (
					<div className="flex items-center gap-2">
						<div className="w-20">
							<Suspense fallback={<div className="h-10 w-20" />}>
								<Sparkline
									className="h-8 w-20"
									data={row.trend.map((y, x) => ({ x, y }))}
									ariaLabel={`${row.name} seven-hour trend`}
									summary={
										<span className="sr-only">
											{row.trend[0]} to {row.trend[6]} requests per minute
										</span>
									}
									accessibilityLayer={false}
								/>
							</Suspense>
						</div>
						<span className="font-medium tabular-nums">{count.format(row.requests)}</span>
					</div>
				),
				sortValue: (row) => row.requests,
			},
			{
				id: "updated",
				header: "Last seen · UTC",
				width: 140,
				cellClassName: "whitespace-nowrap text-xs text-basalt-muted-foreground tabular-nums",
				accessor: (row) => updated.format(new Date(row.updated)),
				sortValue: (row) => row.updated,
			},
			{
				id: "actions",
				header: "Actions",
				sortable: false,
				accessor: (row) => (
					<Button
						size="sm"
						variant="ghost"
						aria-label={`Inspect ${row.name}`}
						onClick={() =>
							setNotice(
								`${row.name} · ${row.region} · ${row.status} · ${count.format(row.requests)} requests/hour`,
							)
						}
					>
						Inspect
					</Button>
				),
			},
		],
		[],
	);
	return (
		<div className="w-full space-y-4" data-demo="operations-table">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Badge variant="outline">Fleet operations</Badge>
				<div className="flex flex-wrap gap-1">
					{(["ready", "loading", "empty", "error"] as const).map((value) => (
						<Button
							key={value}
							size="sm"
							variant={mode === value ? "secondary" : "ghost"}
							aria-pressed={mode === value}
							onClick={() => {
								setMode(value);
								setPage(1);
							}}
						>
							{value[0]?.toUpperCase()}
							{value.slice(1)}
						</Button>
					))}
				</div>
			</div>
			<ResourceList
				title="Device inventory"
				description="Live fleet signals, charge levels and request trends."
				data={[]}
				toolbar={
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex flex-wrap gap-2">
							<Input
								aria-label="Search devices"
								value={query}
								onChange={(event) => {
									setQuery(event.target.value);
									setPage(1);
								}}
								placeholder="Search devices or regions…"
								className="w-60 max-w-full"
							/>
							<select
								aria-label="Device state"
								value={status}
								onChange={(event) => {
									setStatus(event.target.value);
									setPage(1);
								}}
								className="h-9 rounded-basalt-md border border-basalt-border bg-basalt-background px-3 text-sm"
							>
								{["All states", "Online", "Warning", "Offline"].map((value) => (
									<option key={value}>{value}</option>
								))}
							</select>
						</div>
						<p className="text-xs text-basalt-muted-foreground tabular-nums">
							{result.total} devices · {selected.length} selected
						</p>
					</div>
				}
				bulkActions={
					selected.length > 0 ? (
						<div className="flex flex-wrap items-center gap-2 rounded-basalt-md bg-basalt-muted p-2 text-xs">
							<span>{selected.length} devices selected across pages</span>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setInventory((current) =>
										current.map((row) =>
											selected.includes(row.id) ? { ...row, status: "Online" } : row,
										),
									);
									setNotice(`${selected.length} devices resumed`);
									setSelected([]);
								}}
							>
								Resume selected
							</Button>
							<Button size="sm" variant="ghost" onClick={() => setSelected([])}>
								Clear selection
							</Button>
						</div>
					) : undefined
				}
				footer={
					<p role="status" className="min-h-5 text-xs text-basalt-muted-foreground">
						{notice || "Select a column heading to sort. Inventory updates after a short refresh."}
					</p>
				}
			>
				<DataTable
					data={result.rows}
					columns={columns}
					sort={sort}
					onSortChange={(next) => {
						setSort(next);
						setPage(1);
					}}
					manualSorting
					manualFiltering
					manualPagination
					page={page}
					pageSize={4}
					total={result.total}
					onPageChange={setPage}
					selected={selected}
					onSelectedChange={setSelected}
					multiple
					loading={result.loading}
					error={result.error}
					onRetry={() => {
						setMode("ready");
					}}
					empty={
						<div className="space-y-2 py-6 text-center">
							<p>No devices match this view.</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setQuery("");
									setStatus("All states");
									setMode("ready");
								}}
							>
								Reset filters
							</Button>
						</div>
					}
					aria-label="Device inventory"
					className="min-w-[850px]"
				/>
			</ResourceList>
		</div>
	);
}
