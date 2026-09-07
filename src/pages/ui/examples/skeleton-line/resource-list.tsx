import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { useState } from "react";

const RESOURCES = [
	{
		name: "Atlas",
		detail: "Production workspace",
		initials: "AT",
		usage: "42,810",
		status: "Active",
	},
	{
		name: "Northstar",
		detail: "Analytics collection",
		initials: "NO",
		usage: "28,604",
		status: "Active",
	},
	{ name: "Meridian", detail: "Edge delivery", initials: "ME", usage: "16,209", status: "Review" },
	{
		name: "Orbit",
		detail: "Development sandbox",
		initials: "OR",
		usage: "8,340",
		status: "Active",
	},
];

export default function ResourceListSkeleton() {
	const [loading, setLoading] = useState(true);
	const [opened, setOpened] = useState<string | null>(null);
	return (
		<div className="w-full space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold">Workspace leaderboard</h3>
					<p className="text-sm text-basalt-muted-foreground">
						The same columns and rhythm, before and after loading.
					</p>
				</div>
				<Button size="sm" variant="outline" onClick={() => setLoading(!loading)}>
					{loading ? "Show loaded list" : "Replay loading"}
				</Button>
			</div>
			<div role="status" aria-live="polite" className="sr-only">
				{loading ? "Loading workspaces" : "Workspaces loaded"}
			</div>
			<LayerCard outlined padding="none" aria-busy={loading}>
				<div
					role="region"
					aria-label="Workspace leaderboard scroll area"
					// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
					tabIndex={0}
					className="overflow-x-auto"
				>
					<div className="min-w-[560px]">
						<div className="grid grid-cols-[minmax(0,1fr)_90px_90px_70px] gap-4 border-b border-basalt-border px-4 py-3 text-xs text-basalt-muted-foreground">
							<span>Workspace</span>
							<span>Status</span>
							<span className="text-right">Requests</span>
							<span className="sr-only">Actions</span>
						</div>
						{RESOURCES.map((row, index) => (
							<div
								key={row.name}
								className="grid h-20 grid-cols-[minmax(0,1fr)_90px_90px_70px] items-center gap-4 border-b border-basalt-border/60 px-4 last:border-0"
							>
								<div className="flex items-center gap-3">
									{loading ? (
										<SkeletonLine
											minWidth={100}
											maxWidth={100}
											height={36}
											style={{ width: 36, flexShrink: 0 }}
											className="rounded-full"
										/>
									) : (
										<Avatar className="h-9 w-9">
											<AvatarFallback>{row.initials}</AvatarFallback>
										</Avatar>
									)}
									<div className="min-w-0 flex-1 space-y-2">
										{loading ? (
											<>
												<SkeletonLine
													minWidth={65 - index * 6}
													maxWidth={65 - index * 6}
													height={12}
												/>
												<SkeletonLine minWidth={82} maxWidth={82} height={8} />
											</>
										) : (
											<>
												<p className="text-sm font-medium">{row.name}</p>
												<p className="text-xs text-basalt-muted-foreground">{row.detail}</p>
											</>
										)}
									</div>
								</div>
								{loading ? (
									<SkeletonLine minWidth={80} maxWidth={80} height={22} className="rounded-full" />
								) : (
									<Badge variant={row.status === "Active" ? "success" : "warning"}>
										{row.status}
									</Badge>
								)}
								<div className="flex justify-end text-sm tabular-nums">
									{loading ? <SkeletonLine minWidth={75} maxWidth={75} height={12} /> : row.usage}
								</div>
								{loading ? (
									<SkeletonLine minWidth={100} maxWidth={100} height={28} />
								) : (
									<Button
										size="sm"
										variant="ghost"
										aria-label={`Open ${row.name}`}
										onClick={() => setOpened(row.name)}
									>
										Open
									</Button>
								)}
							</div>
						))}
					</div>
				</div>
			</LayerCard>
			<p
				role={loading ? undefined : "status"}
				className="min-h-5 text-xs text-basalt-muted-foreground"
			>
				{opened ? `${opened} selected` : "4 workspaces · Updated just now"}
			</p>
		</div>
	);
}
