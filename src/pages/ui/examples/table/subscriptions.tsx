import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Input } from "@nocoo/basalt/components/input";
import { Meter } from "@nocoo/basalt/components/meter";
import { Pagination } from "@nocoo/basalt/components/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { lazy, Suspense, useMemo, useState } from "react";

const Sparkline = lazy(() =>
	import("@nocoo/basalt/charts/sparkline").then((module) => ({
		default: module.Sparkline<{ x: number; y: number }>,
	})),
);

const SUBSCRIPTIONS = [
	{
		id: "atlas",
		name: "Atlas Cloud",
		team: "Infrastructure",
		plan: "Enterprise",
		monthly: 1240,
		change: 8.2,
		used: 72,
		renewal: "2026-09-28",
		status: "Active",
		history: [40, 52, 48, 56, 64, 68, 72],
	},
	{
		id: "northstar",
		name: "Northstar Analytics",
		team: "Product",
		plan: "Growth",
		monthly: 289,
		change: -12.4,
		used: 46,
		renewal: "2026-09-12",
		status: "Renewing",
		history: [62, 60, 55, 53, 48, 44, 46],
	},
	{
		id: "meridian",
		name: "Meridian Design",
		team: "Design",
		plan: "Team",
		monthly: 96,
		change: 0,
		used: 88,
		renewal: "2026-10-01",
		status: "Active",
		history: [52, 61, 64, 72, 76, 82, 88],
	},
	{
		id: "orbit",
		name: "Orbit Storage",
		team: "Infrastructure",
		plan: "Usage",
		monthly: 52.8,
		change: 24.1,
		used: 94,
		renewal: "2026-09-09",
		status: "Review",
		history: [40, 46, 58, 66, 79, 85, 94],
	},
	{
		id: "harbor",
		name: "Harbor Monitoring",
		team: "Infrastructure",
		plan: "Pro",
		monthly: 179,
		change: -3.6,
		used: 31,
		renewal: "2026-09-22",
		status: "Active",
		history: [48, 42, 40, 38, 35, 34, 31],
	},
	{
		id: "lumen",
		name: "Lumen Support",
		team: "Product",
		plan: "Team",
		monthly: 420,
		change: 6.8,
		used: 64,
		renewal: "2026-09-16",
		status: "Active",
		history: [40, 46, 42, 50, 54, 60, 64],
	},
];
type Subscription = (typeof SUBSCRIPTIONS)[number];
type SortKey = "name" | "monthly" | "change" | "used" | "renewal";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function SubscriptionTable() {
	const [query, setQuery] = useState("");
	const [team, setTeam] = useState("All teams");
	const [sort, setSort] = useState<{ key: SortKey; direction: 1 | -1 }>({
		key: "monthly",
		direction: -1,
	});
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const [mode, setMode] = useState<"ready" | "loading" | "empty" | "error">("ready");
	const [notice, setNotice] = useState("");
	const rows = useMemo(
		() =>
			SUBSCRIPTIONS.filter(
				(row) =>
					row.name.toLowerCase().includes(query.toLowerCase()) &&
					(team === "All teams" || row.team === team),
			).sort((a, b) => {
				const left = a[sort.key],
					right = b[sort.key];
				return (
					(typeof left === "number" && typeof right === "number"
						? left - right
						: String(left).localeCompare(String(right))) * sort.direction
				);
			}),
		[query, team, sort],
	);
	const visible = mode === "empty" ? [] : rows.slice((page - 1) * 4, page * 4);
	const header = (label: string, key: SortKey) => (
		<TableHead
			aria-sort={sort.key === key ? (sort.direction === 1 ? "ascending" : "descending") : "none"}
		>
			<Button
				variant="ghost"
				type="button"
				onClick={() =>
					setSort((current) => ({
						key,
						direction: current.key === key && current.direction === 1 ? -1 : 1,
					}))
				}
			>
				{label}
				<span aria-hidden="true" className="ml-basalt-space-sm">
					{sort.key === key ? (sort.direction === 1 ? "↑" : "↓") : "↕"}
				</span>
			</Button>
		</TableHead>
	);
	const changeText = (row: Subscription) => `${row.change > 0 ? "+" : ""}${row.change.toFixed(1)}%`;
	return (
		<div className="w-full space-y-basalt-space-lg" data-demo="subscription-table">
			<div className="flex flex-wrap items-start justify-between gap-basalt-space-lg">
				<div>
					<p className="text-basalt-sm uppercase tracking-widest text-basalt-muted-foreground">
						Spend management
					</p>
					<h3 className="mt-basalt-space-sm text-basalt-2xl font-semibold">
						Subscriptions & commitments
					</h3>
					<p className="mt-basalt-space-sm text-basalt-base text-basalt-muted-foreground">
						Renewals, usage and spend across your workspace.
					</p>
				</div>
				<div className="text-right">
					<p className="text-basalt-sm text-basalt-muted-foreground">Matching monthly spend</p>
					<p className="mt-basalt-space-sm text-basalt-3xl font-semibold tabular-nums">
						{money.format(rows.reduce((sum, row) => sum + row.monthly, 0))}
					</p>
				</div>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-basalt-space-lg">
				<div className="flex flex-wrap gap-basalt-space-lg">
					<Input
						aria-label="Search subscriptions"
						className="w-60 max-w-full"
						placeholder="Search subscriptions…"
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setPage(1);
						}}
					/>
					<Select
						value={team}
						onValueChange={(value) => {
							setTeam(value);
							setPage(1);
						}}
					>
						<SelectTrigger aria-label="Subscription team" className="w-auto">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{["All teams", "Infrastructure", "Product", "Design"].map((item) => (
								<SelectItem key={item} value={item}>
									{item}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex flex-wrap gap-basalt-space-sm">
					{(["ready", "loading", "empty", "error"] as const).map((value) => (
						<Button
							key={value}
							size="sm"
							variant={mode === value ? "secondary" : "ghost"}
							aria-pressed={mode === value}
							onClick={() => setMode(value)}
						>
							{value[0]?.toUpperCase()}
							{value.slice(1)}
						</Button>
					))}
				</div>
			</div>
			{selected.length > 0 ? (
				<Banner variant="secondary" className="flex-wrap items-center">
					<span>{selected.length} subscriptions selected</span>
					<Button
						size="sm"
						variant="outline"
						onClick={() => {
							setNotice(`Review prepared for ${selected.length} subscriptions`);
							setSelected([]);
						}}
					>
						Prepare review
					</Button>
					<Button size="sm" variant="ghost" onClick={() => setSelected([])}>
						Clear selection
					</Button>
				</Banner>
			) : null}
			<div
				role="region"
				aria-label="Subscription ledger scroll area"
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
				tabIndex={0}
				className="overflow-x-auto rounded-basalt-md border border-basalt-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basalt-primary"
			>
				<Table
					aria-label="Subscription ledger"
					aria-busy={mode === "loading"}
					className="min-w-[55rem]"
				>
					<TableCaption>
						Monthly commitments in USD. Changes compare with the previous month.
					</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>
								<span className="sr-only">Select</span>
							</TableHead>
							{header("Subscription", "name")}
							{header("Monthly cost", "monthly")}
							{header("Change", "change")}
							{header("Usage", "used")}
							{header("Renewal", "renewal")}
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mode === "loading" ? (
							<TableRow>
								<TableCell colSpan={7}>
									<div
										role="status"
										aria-label="Loading subscriptions"
										className="space-y-basalt-space-lg py-basalt-space-lg"
									>
										{[90, 70, 82, 65].map((width) => (
											<SkeletonLine key={width} height={22} minWidth={width} maxWidth={width} />
										))}
									</div>
								</TableCell>
							</TableRow>
						) : mode === "error" ? (
							<TableRow>
								<TableCell colSpan={7}>
									<div
										role="alert"
										className="space-y-basalt-space-lg py-basalt-space-lg text-center"
									>
										<p>We could not refresh your subscriptions.</p>
										<Button
											variant="outline"
											onClick={() => {
												setMode("ready");
												setNotice("Subscriptions refreshed");
											}}
										>
											Try again
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : visible.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7}>
									<div
										role="status"
										className="space-y-basalt-space-lg py-basalt-space-lg text-center"
									>
										<p>No subscriptions match this view.</p>
										<Button
											variant="outline"
											onClick={() => {
												setQuery("");
												setTeam("All teams");
												setMode("ready");
												setPage(1);
											}}
										>
											Reset filters
										</Button>
									</div>
								</TableCell>
							</TableRow>
						) : (
							visible.map((row) => (
								<TableRow key={row.id} variant={selected.includes(row.id) ? "selected" : "default"}>
									<TableCell>
										<Checkbox
											aria-label={`Select ${row.name}`}
											checked={selected.includes(row.id)}
											onCheckedChange={() =>
												setSelected((current) =>
													current.includes(row.id)
														? current.filter((id) => id !== row.id)
														: [...current, row.id],
												)
											}
										/>
									</TableCell>
									<TableCell>
										<p className="whitespace-nowrap font-medium">{row.name}</p>
										<div className="mt-basalt-space-lg flex items-center gap-basalt-space-md">
											<Badge variant="outline">{row.team}</Badge>
											<Badge variant="secondary">{row.plan}</Badge>
										</div>
									</TableCell>
									<TableCell className="text-right font-medium tabular-nums">
										{money.format(row.monthly)}
										<p className="mt-basalt-space-sm text-basalt-sm font-normal text-basalt-muted-foreground">
											per month
										</p>
									</TableCell>
									<TableCell>
										<Badge
											variant={
												row.change > 15 ? "warning" : row.change < 0 ? "success" : "secondary"
											}
										>
											{changeText(row)}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-basalt-space-lg">
											<div className="w-32">
												<Meter value={row.used} aria-label={`${row.name} quota used`} />
											</div>
											<Suspense fallback={<div className="h-10 w-20" />}>
												<Sparkline
													className="h-4 w-20"
													data={row.history.map((y, x) => ({ x, y }))}
													ariaLabel={`${row.name} usage trend`}
													summary={
														<span className="sr-only">
															Usage moved from {row.history[0]}% to {row.used}%.
														</span>
													}
													accessibilityLayer={false}
												/>
											</Suspense>
										</div>
									</TableCell>
									<TableCell className="whitespace-nowrap">
										<p className="text-basalt-sm tabular-nums">
											{new Intl.DateTimeFormat("en-GB", {
												day: "numeric",
												month: "short",
												timeZone: "UTC",
											}).format(new Date(row.renewal))}
										</p>
										<Badge
											variant={
												row.status === "Review"
													? "warning"
													: row.status === "Renewing"
														? "info"
														: "outline"
											}
											className="mt-basalt-space-md"
										>
											{row.status}
										</Badge>
									</TableCell>
									<TableCell>
										<Button
											size="sm"
											variant="ghost"
											aria-label={`Manage ${row.name}`}
											onClick={() =>
												setNotice(
													`${row.name}: ${row.plan} plan, ${money.format(row.monthly)} per month, renews ${row.renewal}`,
												)
											}
										>
											Manage
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-basalt-space-lg">
				<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
					{notice || `${rows.length} subscriptions · ${selected.length} selected`}
				</p>
				<Pagination
					page={page}
					pageCount={Math.max(1, Math.ceil(rows.length / 4))}
					onPageChange={setPage}
					disabled={mode !== "ready"}
				/>
			</div>
		</div>
	);
}
