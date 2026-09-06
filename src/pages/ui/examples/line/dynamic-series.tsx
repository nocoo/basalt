import { LineChart } from "@nocoo/basalt/charts/line";
import {
	ChartTooltipDivider,
	ChartTooltipRow,
	ChartTooltipSummary,
} from "@nocoo/basalt/charts/tooltip";
import { useState } from "react";

interface RegionalLatencyPoint {
	x: string;
	p95US: number;
	p95EU: number;
	p95APAC: number;
	deltaAnomaly: number; // contains negative values
	targetSLA: number;
	regionLeader: string;
	inViolation: boolean;
}

const REGION_DATA: RegionalLatencyPoint[] = [
	{
		x: "10:00",
		p95US: 45,
		p95EU: 52,
		p95APAC: 110,
		deltaAnomaly: -12,
		targetSLA: 100,
		regionLeader: "US-East",
		inViolation: false,
	},
	{
		x: "11:00",
		p95US: 48,
		p95EU: 58,
		p95APAC: 135,
		deltaAnomaly: 25,
		targetSLA: 100,
		regionLeader: "EU-Central",
		inViolation: true,
	},
	{
		x: "12:00",
		p95US: 52,
		p95EU: 64,
		p95APAC: 142,
		deltaAnomaly: 32,
		targetSLA: 100,
		regionLeader: "US-East",
		inViolation: true,
	},
	{
		x: "13:00",
		p95US: 46,
		p95EU: 50,
		p95APAC: 98,
		deltaAnomaly: -8,
		targetSLA: 100,
		regionLeader: "US-East",
		inViolation: false,
	},
	{
		x: "14:00",
		p95US: 44,
		p95EU: 49,
		p95APAC: 92,
		deltaAnomaly: -15,
		targetSLA: 100,
		regionLeader: "US-West",
		inViolation: false,
	},
];

const INITIAL_SERIES = [
	{ key: "p95US" as const, label: "US Region (p95)", color: "hsl(var(--basalt-chart-1))" },
	{ key: "p95EU" as const, label: "EU Region (p95)", color: "hsl(var(--basalt-chart-2))" },
	{ key: "p95APAC" as const, label: "APAC Region (p95)", color: "hsl(var(--basalt-chart-3))" },
	{ key: "deltaAnomaly" as const, label: "SLA Variance (±)", color: "hsl(var(--basalt-chart-4))" },
	{ key: "targetSLA" as const, label: "SLA Ceiling", color: "hsl(var(--basalt-chart-5))" },
];

export default function LineDynamicSeries() {
	const [activeRegion, setActiveRegion] = useState<string>("all");
	const [containerWidth, setContainerWidth] = useState<"full" | "narrow">("full");

	const filteredSeries =
		activeRegion === "all"
			? INITIAL_SERIES
			: INITIAL_SERIES.filter((s) => s.key === activeRegion || s.key === "targetSLA");

	return (
		<div
			className={`space-y-4 transition-all duration-200 motion-reduce:transition-none min-w-0 ${
				containerWidth === "narrow" ? "w-full max-w-sm" : "w-full max-w-2xl"
			}`}
		>
			<div className="flex flex-wrap items-center justify-between gap-2 text-xs">
				<div className="flex flex-wrap items-center gap-1.5">
					<span className="font-medium text-basalt-foreground">Scope:</span>
					{["all", "p95US", "p95EU", "p95APAC", "deltaAnomaly"].map((key) => {
						const isSelected = activeRegion === key;
						return (
							<button
								key={key}
								type="button"
								aria-pressed={isSelected}
								onClick={() => setActiveRegion(key)}
								className={`rounded px-2 py-0.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-basalt-ring ${
									isSelected
										? "bg-basalt-primary text-basalt-primary-foreground"
										: "bg-basalt-muted text-basalt-muted-foreground hover:text-basalt-foreground"
								}`}
							>
								{key === "all"
									? "All Regions"
									: (INITIAL_SERIES.find((s) => s.key === key)?.label ?? key)}
							</button>
						);
					})}
				</div>

				<div className="flex flex-wrap items-center gap-1.5">
					<span className="font-medium text-basalt-foreground">Resize:</span>
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
						Full
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
						Narrow
					</button>
				</div>
			</div>

			<LineChart
				data={REGION_DATA}
				series={filteredSeries}
				showAxes
				showLegend
				className="h-64 w-full"
				ariaLabel="Regional latency and variance monitor"
				xValueFormatter={(x) => `${String(x)} CST`}
				valueFormatter={(val) => `${val}ms`}
				yDomain={[-20, 160]}
				customTooltip={({ active, payload, label }) => {
					if (!active || !payload?.length) return null;
					const slaItem = payload.find((item) => item.dataKey === "targetSLA");
					const regionItems = payload.filter((item) => item.dataKey !== "targetSLA");
					return (
						<div
							data-testid="chart-custom-tooltip"
							className="rounded-lg border border-basalt-border/60 bg-basalt-popover p-3 text-xs shadow-md"
						>
							<p className="font-semibold text-basalt-popover-foreground mb-1.5">{label} CST</p>
							<div className="space-y-1">
								{regionItems.map((entry) => (
									<ChartTooltipRow
										key={entry.dataKey}
										label={entry.name}
										value={entry.value}
										unit="ms"
										color={entry.color}
									/>
								))}
								{slaItem ? (
									<>
										<ChartTooltipDivider />
										<ChartTooltipSummary
											label={slaItem.name ?? "SLA Ceiling"}
											value={slaItem.value}
											unit="ms"
										/>
									</>
								) : null}
							</div>
						</div>
					);
				}}
				summary="Real-time multi-region latency telemetry. Highlights negative variance anomalies against fixed SLA ceiling."
			/>
		</div>
	);
}
