import { AreaChart } from "@nocoo/basalt/charts/area";
import { useMemo, useState } from "react";

interface TelemetryPoint {
	x: string;
	edgeCache: number;
	originCompute: number;
	serviceDb: number | null;
	objectStorage: number;
	searchIndex: number;
	environment: string;
	isLive: boolean;
}

const RAW_DATA: TelemetryPoint[] = [
	{
		x: "00:00",
		edgeCache: 320,
		originCompute: 180,
		serviceDb: 90,
		objectStorage: 45,
		searchIndex: 15,
		environment: "prod",
		isLive: true,
	},
	{
		x: "04:00",
		edgeCache: 210,
		originCompute: 120,
		serviceDb: 60,
		objectStorage: 40,
		searchIndex: 10,
		environment: "prod",
		isLive: true,
	},
	{
		x: "08:00",
		edgeCache: 540,
		originCompute: 390,
		serviceDb: 210,
		objectStorage: 85,
		searchIndex: 40,
		environment: "prod",
		isLive: true,
	},
	{
		x: "12:00",
		edgeCache: 780,
		originCompute: 520,
		serviceDb: null, // nullable service interruption simulation
		objectStorage: 130,
		searchIndex: 75,
		environment: "prod",
		isLive: true,
	},
	{
		x: "16:00",
		edgeCache: 690,
		originCompute: 460,
		serviceDb: 290,
		objectStorage: 110,
		searchIndex: 60,
		environment: "prod",
		isLive: true,
	},
	{
		x: "20:00",
		edgeCache: 480,
		originCompute: 310,
		serviceDb: 180,
		objectStorage: 70,
		searchIndex: 30,
		environment: "prod",
		isLive: true,
	},
];

const ALL_SERIES = [
	{ key: "edgeCache" as const, label: "Edge Cache", color: "hsl(var(--basalt-chart-1))" },
	{ key: "originCompute" as const, label: "Origin Compute", color: "hsl(var(--basalt-chart-2))" },
	{ key: "serviceDb" as const, label: "Service DB", color: "hsl(var(--basalt-chart-3))" },
	{ key: "objectStorage" as const, label: "Object Storage", color: "hsl(var(--basalt-chart-4))" },
	{ key: "searchIndex" as const, label: "Search Index", color: "hsl(var(--basalt-chart-5))" },
];

export default function AreaDynamicSeries() {
	const [activeKeys, setActiveKeys] = useState<Set<string>>(
		new Set(["edgeCache", "originCompute", "serviceDb", "objectStorage", "searchIndex"]),
	);
	const [isPercent, setIsPercent] = useState(false);
	const [containerWidth, setContainerWidth] = useState<"full" | "narrow">("full");

	const visibleSeries = useMemo(
		() => ALL_SERIES.filter((item) => activeKeys.has(item.key)),
		[activeKeys],
	);

	const toggleSeries = (key: string) => {
		setActiveKeys((prev) => {
			const next = new Set(prev);
			if (next.has(key)) {
				if (next.size > 1) {
					next.delete(key);
				}
			} else {
				next.add(key);
			}
			return next;
		});
	};

	return (
		<div
			className={`space-y-4 transition-all duration-200 motion-reduce:transition-none min-w-0 ${
				containerWidth === "narrow" ? "w-full max-w-sm" : "w-full max-w-2xl"
			}`}
		>
			<div className="flex flex-wrap items-center justify-between gap-2 text-xs">
				<div className="flex flex-wrap items-center gap-1.5">
					<span className="font-medium text-basalt-foreground">Container:</span>
					<button
						type="button"
						aria-pressed={containerWidth === "full"}
						onClick={() => setContainerWidth("full")}
						className={`rounded px-2 py-0.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-basalt-ring ${
							containerWidth === "full"
								? "bg-basalt-primary text-basalt-primary-foreground"
								: "bg-basalt-muted text-basalt-muted-foreground hover:text-basalt-foreground"
						}`}
					>
						Full (672px)
					</button>
					<button
						type="button"
						aria-pressed={containerWidth === "narrow"}
						onClick={() => setContainerWidth("narrow")}
						className={`rounded px-2 py-0.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-basalt-ring ${
							containerWidth === "narrow"
								? "bg-basalt-primary text-basalt-primary-foreground"
								: "bg-basalt-muted text-basalt-muted-foreground hover:text-basalt-foreground"
						}`}
					>
						Narrow (384px)
					</button>
				</div>
				<button
					type="button"
					aria-pressed={isPercent}
					onClick={() => setIsPercent((p) => !p)}
					className={`rounded border border-basalt-border px-2.5 py-0.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-basalt-ring ${
						isPercent
							? "bg-basalt-primary text-basalt-primary-foreground"
							: "bg-basalt-background text-basalt-foreground hover:bg-basalt-muted"
					}`}
				>
					Mode: {isPercent ? "100% Normalized" : "Stacked Absolute"}
				</button>
			</div>

			<AreaChart
				data={RAW_DATA}
				series={visibleSeries}
				stacked
				stackOffset={isPercent ? "expand" : undefined}
				showAxes
				className="h-64 w-full"
				ariaLabel="Dynamic multi-service telemetry chart"
				xValueFormatter={(x) => `${String(x)} UTC`}
				valueFormatter={(val) => (isPercent ? `${(val * 100).toFixed(0)}%` : `${val} req/s`)}
				customTooltip={({ active, payload, label }) => {
					if (!active || !payload?.length) return null;
					const total = payload.reduce((sum, item) => {
						const v = typeof item.value === "number" ? item.value : 0;
						return sum + (Number.isFinite(v) ? v : 0);
					}, 0);
					return (
						<div
							data-testid="chart-custom-tooltip"
							className="rounded-lg border border-basalt-border/60 bg-basalt-popover p-3 text-xs shadow-md"
						>
							<p className="font-semibold text-basalt-popover-foreground mb-1.5">{label} UTC</p>
							<div className="space-y-1">
								{payload.map((entry) => {
									const raw = typeof entry.value === "number" ? entry.value : 0;
									const pct = total > 0 ? ((raw / total) * 100).toFixed(1) : "0.0";
									return (
										<div key={entry.dataKey} className="flex items-center justify-between gap-4">
											<span className="flex items-center gap-1.5 text-basalt-muted-foreground">
												<span
													className="h-2 w-2 rounded-full"
													style={{ backgroundColor: entry.color }}
												/>
												{entry.name}
											</span>
											<span className="font-mono font-medium text-basalt-foreground tabular-nums">
												{raw} req/s {isPercent && `(${pct}%)`}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					);
				}}
				legend={({ items }) => {
					// Validate resolved items shape while maintaining stable control buttons
					const activeLabels = new Set(items.map((it) => it.label));
					return (
						<div
							data-testid="interactive-legend-controls"
							className="mt-3 flex flex-wrap gap-1.5 text-xs"
						>
							{ALL_SERIES.map((s) => {
								const isIncluded = activeLabels.has(s.label);
								return (
									<button
										key={s.key}
										type="button"
										aria-pressed={isIncluded}
										onClick={() => toggleSeries(s.key)}
										className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-basalt-ring ${
											isIncluded
												? "border-basalt-border bg-basalt-card text-basalt-foreground shadow-xs"
												: "border-basalt-border/40 bg-basalt-muted text-basalt-muted-foreground hover:text-basalt-foreground"
										}`}
									>
										<span
											className={`h-2 w-2 rounded-full transition-opacity ${
												isIncluded ? "opacity-100" : "opacity-30"
											}`}
											style={{ backgroundColor: s.color }}
											aria-hidden="true"
										/>
										<span>{s.label}</span>
									</button>
								);
							})}
						</div>
					);
				}}
				summary="Dynamic multi-service telemetry showing 5 services over 24 hours. Includes nullable compute windows, interactive legend series toggles, and responsive container resizing."
			/>
		</div>
	);
}
