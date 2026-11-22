import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Skeleton } from "@nocoo/basalt/components/skeleton";
import { type ReactNode, useState } from "react";

function AreaChart({
	data,
	className,
	ariaLabel,
	summary,
}: {
	data: { x: string; y: number }[];
	className?: string;
	ariaLabel: string;
	summary: ReactNode;
}) {
	const max = Math.max(...data.map((point) => point.y));
	const points = data
		.map(
			(point, index) =>
				`${(index / Math.max(data.length - 1, 1)) * 100},${80 - (point.y / max) * 64}`,
		)
		.join(" ");
	return (
		<span className={className}>
			<svg viewBox="0 0 100 84" className="h-full w-full" role="img" aria-label={ariaLabel}>
				<polyline points={points} fill="none" stroke="hsl(var(--basalt-chart-1))" strokeWidth="3" />
			</svg>
			{summary}
		</span>
	);
}

function DonutChart({
	data,
	className,
	ariaLabel,
	summary,
}: {
	data: { name: string; value: number }[];
	className?: string;
	ariaLabel: string;
	summary: ReactNode;
}) {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	let offset = 0;
	return (
		<span className={className}>
			<svg viewBox="0 0 40 40" className="h-full w-full" role="img" aria-label={ariaLabel}>
				<circle
					cx="20"
					cy="20"
					r="14"
					fill="none"
					stroke="hsl(var(--basalt-secondary))"
					strokeWidth="6"
				/>
				{data.map((item, index) => {
					const length = (item.value / total) * 100;
					const start = offset;
					offset += length;
					return (
						<circle
							key={item.name}
							cx="20"
							cy="20"
							r="14"
							fill="none"
							pathLength="100"
							stroke={`hsl(var(--basalt-chart-${index + 1}))`}
							strokeWidth="6"
							strokeDasharray={`${length} ${100 - length}`}
							strokeDashoffset={-start}
							transform="rotate(-90 20 20)"
						/>
					);
				})}
			</svg>
			{summary}
		</span>
	);
}

const METRICS = [
	{ title: "Patient visits", value: "148,290", change: "+18.6%", width: 70 },
	{ title: "Active folders", value: "24", change: "+4 this week", width: 48 },
	{ title: "Success rate", value: "99.98%", change: "+0.02%", width: 62 },
	{ title: "Response time", value: "42 ms", change: "−8 ms", width: 55 },
];

export default function DashboardSkeleton() {
	const [loading, setLoading] = useState(true);
	return (
		<div className="w-full space-y-basalt-space-lg">
			<div className="flex flex-wrap items-center justify-between gap-basalt-space-lg">
				<div>
					<p className="text-basalt-sm uppercase tracking-wider text-basalt-muted-foreground">
						Care team overview
					</p>
					<h3 className="mt-basalt-space-sm text-basalt-xl font-semibold">
						A clear view of your activity
					</h3>
				</div>
				<Button size="sm" variant="outline" onClick={() => setLoading(!loading)}>
					{loading ? "Show loaded dashboard" : "Replay loading"}
				</Button>
			</div>
			<div role="status" aria-live="polite" className="sr-only">
				{loading ? "Loading dashboard" : "Dashboard loaded"}
			</div>
			<div aria-busy={loading} className="space-y-basalt-space-lg">
				<div className="grid grid-cols-1 gap-basalt-space-lg sm:grid-cols-2 xl:grid-cols-4">
					{METRICS.map((metric) => (
						<LayerCard key={metric.title} outlined className="h-32 space-y-basalt-space-lg">
							{loading ? (
								<>
									<Skeleton width={`${metric.width}%`} height={10} />
									<Skeleton width="50%" height={27} />
									<Skeleton width="38%" height={9} />
								</>
							) : (
								<>
									<p className="text-basalt-sm text-basalt-muted-foreground">{metric.title}</p>
									<p className="text-basalt-3xl font-semibold tabular-nums">{metric.value}</p>
									<p className="text-basalt-sm text-basalt-muted-foreground">{metric.change}</p>
								</>
							)}
						</LayerCard>
					))}
				</div>
				<div className="grid gap-basalt-space-lg lg:grid-cols-[minmax(0,1fr)_15rem]">
					<LayerCard outlined className="min-w-0">
						<div className="mb-basalt-space-lg flex h-6 items-center justify-between gap-basalt-space-lg">
							{loading ? (
								<Skeleton width="36%" height={13} />
							) : (
								<h4 className="text-basalt-base font-medium">Request volume</h4>
							)}
							<Badge variant="outline">Last 7 days</Badge>
						</div>
						<div className="h-56">
							{loading ? (
								<div
									aria-hidden="true"
									className="flex h-full items-end gap-basalt-space-lg border-b border-basalt-border pb-basalt-space-lg"
								>
									{[32, 48, 40, 67, 55, 84, 69, 78, 64, 92, 80, 96].map((height, index) => (
										<Skeleton
											key={`${index}-${height}`}
											variant="block"
											width="100%"
											height={`${height}%`}
											className="flex-1 rounded-b-none rounded-t-basalt-md"
										/>
									))}
								</div>
							) : (
								<AreaChart
									className="block h-52 w-full"
									data={[
										{ x: "Mon", y: 12 },
										{ x: "Tue", y: 21 },
										{ x: "Wed", y: 18 },
										{ x: "Thu", y: 32 },
										{ x: "Fri", y: 27 },
										{ x: "Sat", y: 42 },
										{ x: "Sun", y: 48 },
									]}
									ariaLabel="Weekly patient visit volume"
									summary={
										<span className="sr-only">
											Patient visits rose from 12 thousand on Monday to 48 thousand on Sunday.
										</span>
									}
								/>
							)}
						</div>
						<div className="mt-basalt-space-lg flex h-5 items-center gap-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
							{loading ? <Skeleton width="55%" /> : "Traffic is up 18.6% compared with last week."}
						</div>
					</LayerCard>
					<LayerCard
						outlined
						className="flex flex-col items-center justify-between gap-basalt-space-lg"
					>
						<h4 className="self-start text-basalt-base font-medium">Appointment formats</h4>
						<div className="flex h-40 w-40 items-center justify-center">
							{loading ? (
								<div aria-hidden="true" className="relative h-32 w-32">
									<Skeleton variant="circle" width={128} height={128} />
									<div className="absolute inset-7 rounded-basalt-full bg-basalt-background" />
								</div>
							) : (
								<DonutChart
									data={[
										{ name: "Clinic", value: 64 },
										{ name: "Video", value: 28 },
										{ name: "Home visits", value: 8 },
									]}
									ariaLabel="Appointment formats"
									className="block h-36 w-40"
									summary={<span className="sr-only">Clinic 64%, Video 28%, other 8%.</span>}
								/>
							)}
						</div>
						<div className="w-full space-y-basalt-space-lg">
							{["Clinic · 64%", "Video · 28%", "Home visits · 8%"].map((label, i) => (
								<div key={label} className="h-4 text-basalt-sm text-basalt-muted-foreground">
									{loading ? <Skeleton width={`${85 - i * 13}%`} /> : label}
								</div>
							))}
						</div>
					</LayerCard>
				</div>
			</div>
		</div>
	);
}
