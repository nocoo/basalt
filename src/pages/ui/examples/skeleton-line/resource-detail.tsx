import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { useState } from "react";

export default function ResourceDetailSkeleton() {
	const [loading, setLoading] = useState(true);
	return (
		<div className="w-full space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h3 className="text-lg font-semibold">Resource detail</h3>
				<Button variant="outline" size="sm" onClick={() => setLoading(!loading)}>
					{loading ? "Show loaded detail" : "Replay loading"}
				</Button>
			</div>
			<div role="status" aria-live="polite" className="sr-only">
				{loading ? "Loading resource detail" : "Resource detail loaded"}
			</div>
			<div aria-busy={loading} className="space-y-4">
				<LayerCard outlined className="flex h-44 items-center sm:h-28 gap-4">
					<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-basalt-lg bg-basalt-muted text-xl font-semibold">
						{loading ? <SkeletonLine minWidth={100} maxWidth={100} height={56} /> : "A"}
					</div>
					<div className="min-w-0 flex-1 space-y-3">
						{loading ? (
							<>
								<SkeletonLine minWidth={48} maxWidth={48} height={20} />
								<SkeletonLine minWidth={72} maxWidth={72} height={10} />
							</>
						) : (
							<>
								<h4 className="text-xl font-semibold">Atlas production</h4>
								<p className="text-sm text-basalt-muted-foreground">
									A shared home for your production services.
								</p>
							</>
						)}
					</div>
				</LayerCard>
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
					<LayerCard outlined className="space-y-6">
						<div className="h-60 space-y-3 sm:h-28">
							{loading ? (
								[80, 100, 94, 62].map((width) => (
									<SkeletonLine key={width} minWidth={width} maxWidth={width} height={12} />
								))
							) : (
								<>
									<h4 className="font-medium">Overview</h4>
									<p className="text-sm leading-6 text-basalt-muted-foreground">
										Atlas handles production traffic across three regions. Deployments are reviewed
										before release, with health checks on every route.
									</p>
								</>
							)}
						</div>
						<div className="flex h-44 items-center justify-center overflow-hidden rounded-basalt-md bg-basalt-muted/50">
							{loading ? (
								<SkeletonLine minWidth={100} maxWidth={100} height={176} />
							) : (
								<div className="text-center">
									<p className="text-4xl font-semibold tabular-nums">99.98%</p>
									<p className="mt-2 text-sm text-basalt-muted-foreground">
										Availability over the last 30 days
									</p>
								</div>
							)}
						</div>
					</LayerCard>
					<LayerCard outlined className="space-y-6">
						<h4 className="text-sm font-medium">Details</h4>
						{[
							{ name: "Status", value: "Healthy" },
							{ name: "Region", value: "US East · EU West" },
							{ name: "Owner", value: "Platform team" },
							{ name: "Last deployment", value: "Today, 09:42" },
						].map((item) => (
							<div key={item.name} className="h-12 space-y-2">
								<p className="text-xs text-basalt-muted-foreground">{item.name}</p>
								{loading ? (
									<SkeletonLine minWidth={78} maxWidth={78} height={12} />
								) : item.name === "Status" ? (
									<Badge variant="success" dot>
										{item.value}
									</Badge>
								) : (
									<p className="text-sm">{item.value}</p>
								)}
							</div>
						))}
					</LayerCard>
				</div>
			</div>
		</div>
	);
}
