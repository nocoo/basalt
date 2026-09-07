import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { lazy, Suspense, useState } from "react";

const AreaChart = lazy(() =>
	import("@nocoo/basalt/charts/area").then((module) => ({
		default: module.AreaChart<{ x: string; y: number }>,
	})),
);
const DonutChart = lazy(() =>
	import("@nocoo/basalt/charts/donut").then((module) => ({ default: module.DonutChart })),
);

const METRICS = [
	{ title: "Total requests", value: "148,290", change: "+18.6%", width: 70 },
	{ title: "Active projects", value: "24", change: "+4 this week", width: 48 },
	{ title: "Success rate", value: "99.98%", change: "+0.02%", width: 62 },
	{ title: "Response time", value: "42 ms", change: "−8 ms", width: 55 },
];

export default function DashboardSkeleton() {
	const [loading, setLoading] = useState(true);
	return (
		<div className="w-full space-y-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-widest text-basalt-muted-foreground">
						Workspace overview
					</p>
					<h3 className="mt-1 text-xl font-semibold">A clear view of your activity</h3>
				</div>
				<Button size="sm" variant="outline" onClick={() => setLoading(!loading)}>
					{loading ? "Show loaded dashboard" : "Replay loading"}
				</Button>
			</div>
			<div role="status" aria-live="polite" className="sr-only">
				{loading ? "Loading dashboard" : "Dashboard loaded"}
			</div>
			<div aria-busy={loading} className="space-y-4">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
					{METRICS.map((metric) => (
						<LayerCard key={metric.title} outlined className="h-32 space-y-4">
							{loading ? (
								<>
									<SkeletonLine minWidth={metric.width} maxWidth={metric.width} height={10} />
									<SkeletonLine minWidth={50} maxWidth={50} height={27} />
									<SkeletonLine minWidth={38} maxWidth={38} height={9} />
								</>
							) : (
								<>
									<p className="text-xs text-basalt-muted-foreground">{metric.title}</p>
									<p className="text-2xl font-semibold tabular-nums">{metric.value}</p>
									<p className="text-xs text-basalt-muted-foreground">{metric.change}</p>
								</>
							)}
						</LayerCard>
					))}
				</div>
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
					<LayerCard outlined className="min-w-0">
						<div className="mb-5 flex h-6 items-center justify-between gap-3">
							{loading ? (
								<SkeletonLine minWidth={36} maxWidth={36} height={13} />
							) : (
								<h4 className="text-sm font-medium">Request volume</h4>
							)}
							<Badge variant="outline">Last 7 days</Badge>
						</div>
						<div className="h-56">
							{loading ? (
								<div
									aria-hidden="true"
									className="flex h-full items-end gap-2 border-b border-basalt-border pb-3"
								>
									{[32, 48, 40, 67, 55, 84, 69, 78, 64, 92, 80, 96].map((height, index) => (
										<SkeletonLine
											key={`${index}-${height}`}
											minWidth={100}
											maxWidth={100}
											className="flex-1 rounded-t-md"
											style={{ height: `${height}%` }}
										/>
									))}
								</div>
							) : (
								<Suspense fallback={<SkeletonLine height={208} />}>
									<AreaChart
										className="h-52 w-full"
										data={[
											{ x: "Mon", y: 12 },
											{ x: "Tue", y: 21 },
											{ x: "Wed", y: 18 },
											{ x: "Thu", y: 32 },
											{ x: "Fri", y: 27 },
											{ x: "Sat", y: 42 },
											{ x: "Sun", y: 48 },
										]}
										ariaLabel="Weekly request volume"
										summary={
											<span className="sr-only">
												Requests rose from 12 thousand on Monday to 48 thousand on Sunday.
											</span>
										}
									/>
								</Suspense>
							)}
						</div>
						<div className="mt-4 flex h-5 items-center gap-2 text-xs text-basalt-muted-foreground">
							{loading ? (
								<SkeletonLine minWidth={55} maxWidth={55} />
							) : (
								"Traffic is up 18.6% compared with last week."
							)}
						</div>
					</LayerCard>
					<LayerCard outlined className="flex flex-col items-center justify-between gap-4">
						<h4 className="self-start text-sm font-medium">Traffic sources</h4>
						<div className="flex h-40 w-40 items-center justify-center">
							{loading ? (
								<div aria-hidden="true" className="relative h-32 w-32">
									<SkeletonLine
										minWidth={100}
										maxWidth={100}
										height={128}
										className="rounded-full"
									/>
									<div className="absolute inset-7 rounded-full bg-basalt-background" />
								</div>
							) : (
								<Suspense fallback={<SkeletonLine height={144} />}>
									<DonutChart
										data={[
											{ name: "Direct", value: 64 },
											{ name: "API", value: 28 },
											{ name: "Other", value: 8 },
										]}
										ariaLabel="Traffic sources"
										className="h-36 w-40"
										summary={<span className="sr-only">Direct 64%, API 28%, other 8%.</span>}
									/>
								</Suspense>
							)}
						</div>
						<div className="w-full space-y-3">
							{["Direct · 64%", "API · 28%", "Other · 8%"].map((label, i) => (
								<div key={label} className="h-4 text-xs text-basalt-muted-foreground">
									{loading ? <SkeletonLine minWidth={85 - i * 13} maxWidth={85 - i * 13} /> : label}
								</div>
							))}
						</div>
					</LayerCard>
				</div>
			</div>
		</div>
	);
}
