import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Skeleton } from "@nocoo/basalt/components/skeleton";
import { useState } from "react";

export default function ResourceDetailSkeleton() {
	const [loading, setLoading] = useState(true);
	return (
		<div className="w-full space-y-basalt-space-lg">
			<div className="flex flex-wrap items-center justify-between gap-basalt-space-lg">
				<h3 className="text-basalt-xl font-semibold">Resource detail</h3>
				<Button variant="outline" size="sm" onClick={() => setLoading(!loading)}>
					{loading ? "Show loaded detail" : "Replay loading"}
				</Button>
			</div>
			<div role="status" aria-live="polite" className="sr-only">
				{loading ? "Loading resource detail" : "Resource detail loaded"}
			</div>
			<div aria-busy={loading} className="space-y-basalt-space-lg">
				<LayerCard outlined className="flex h-44 items-center gap-basalt-space-lg sm:h-28">
					<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-basalt-lg bg-basalt-muted text-basalt-xl font-semibold">
						{loading ? <Skeleton variant="block" height={56} /> : "A"}
					</div>
					<div className="min-w-0 flex-1 space-y-basalt-space-lg">
						{loading ? (
							<>
								<Skeleton width="48%" height={20} />
								<Skeleton width="72%" height={10} />
							</>
						) : (
							<>
								<h4 className="text-basalt-xl font-semibold">Atlas care program</h4>
								<p className="text-basalt-base text-basalt-muted-foreground">
									A shared home for your active care programs.
								</p>
							</>
						)}
					</div>
				</LayerCard>
				<div className="grid gap-basalt-space-lg lg:grid-cols-[minmax(0,1fr)_15rem]">
					<LayerCard outlined className="space-y-basalt-space-lg">
						<div className="h-60 space-y-basalt-space-lg sm:h-28">
							{loading ? (
								[80, 100, 94, 62].map((width) => (
									<Skeleton key={width} width={`${width}%`} height={12} />
								))
							) : (
								<>
									<h4 className="font-medium">Overview</h4>
									<p className="text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
										Atlas coordinates appointments across three clinics. Care teams review shared
										notes before the next patient check-in.
									</p>
								</>
							)}
						</div>
						<div className="flex h-44 items-center justify-center overflow-hidden rounded-basalt-md bg-basalt-muted/50">
							{loading ? (
								<Skeleton variant="block" height={176} />
							) : (
								<div className="text-center">
									<p className="text-basalt-3xl font-semibold tabular-nums">99.98%</p>
									<p className="mt-basalt-space-lg text-basalt-base text-basalt-muted-foreground">
										Availability over the last 30 days
									</p>
								</div>
							)}
						</div>
					</LayerCard>
					<LayerCard outlined className="space-y-basalt-space-lg">
						<h4 className="text-basalt-base font-medium">Details</h4>
						{[
							{ name: "Status", value: "Healthy" },
							{ name: "Region", value: "US East · EU West" },
							{ name: "Care lead", value: "Care coordination team" },
							{ name: "Last check-in", value: "Today, 09:42" },
						].map((item) => (
							<div key={item.name} className="h-12 space-y-basalt-space-lg">
								<p className="text-basalt-sm text-basalt-muted-foreground">{item.name}</p>
								{loading ? (
									<Skeleton width="78%" height={12} />
								) : item.name === "Status" ? (
									<Badge tone="success" dot>
										{item.value}
									</Badge>
								) : (
									<p className="text-basalt-base">{item.value}</p>
								)}
							</div>
						))}
					</LayerCard>
				</div>
			</div>
		</div>
	);
}
