import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { useState } from "react";

const RESOURCES = [
	{
		name: "Atlas",
		detail: "Clinical Ops care team",
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
		<div className="w-full space-y-basalt-space-lg">
			<div className="flex flex-wrap items-center justify-between gap-basalt-space-lg">
				<div>
					<h3 className="text-basalt-xl font-semibold">Care team activity</h3>
					<p className="text-basalt-base text-basalt-muted-foreground">
						The same columns and rhythm, before and after loading.
					</p>
				</div>
				<Button size="sm" variant="outline" onClick={() => setLoading(!loading)}>
					{loading ? "Show loaded list" : "Replay loading"}
				</Button>
			</div>
			<div role="status" aria-live="polite" className="sr-only">
				{loading ? "Loading care teams" : "Care teams loaded"}
			</div>
			<LayerCard outlined padding="none" aria-busy={loading}>
				<div
					role="region"
					aria-label="Care team activity scroll area"
					// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
					tabIndex={0}
					className="overflow-x-auto"
				>
					<div className="min-w-[35rem]">
						<div className="grid grid-cols-[minmax(0,1fr)_5.625rem_5.625rem_4.375rem] gap-basalt-space-lg border-b border-basalt-border px-basalt-space-lg py-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
							<span>Care team</span>
							<span>Status</span>
							<span className="text-right">Care events</span>
							<span className="sr-only">Actions</span>
						</div>
						{RESOURCES.map((row, index) => (
							<div
								key={row.name}
								className="grid h-20 grid-cols-[minmax(0,1fr)_5.625rem_5.625rem_4.375rem] items-center gap-basalt-space-lg border-b border-basalt-border/60 px-basalt-space-lg last:border-0"
							>
								<div className="flex items-center gap-basalt-space-lg">
									{loading ? (
										<SkeletonLine
											minWidth={100}
											maxWidth={100}
											height={36}
											style={{ width: 36, flexShrink: 0 }}
											className="rounded-basalt-full"
										/>
									) : (
										<Avatar className="h-9 w-9">
											<AvatarFallback>{row.initials}</AvatarFallback>
										</Avatar>
									)}
									<div className="min-w-0 flex-1 space-y-basalt-space-lg">
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
												<p className="text-basalt-base font-medium">{row.name}</p>
												<p className="text-basalt-sm text-basalt-muted-foreground">{row.detail}</p>
											</>
										)}
									</div>
								</div>
								{loading ? (
									<SkeletonLine
										minWidth={80}
										maxWidth={80}
										height={22}
										className="rounded-basalt-full"
									/>
								) : (
									<Badge variant={row.status === "Active" ? "success" : "warning"}>
										{row.status}
									</Badge>
								)}
								<div className="flex justify-end text-basalt-base tabular-nums">
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
				className="min-h-5 text-basalt-sm text-basalt-muted-foreground"
			>
				{opened ? `${opened} selected` : "4 care teams · Updated just now"}
			</p>
		</div>
	);
}
