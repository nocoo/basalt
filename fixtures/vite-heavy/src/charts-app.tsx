import { AreaChart } from "@nocoo/basalt/charts/area";
import { BarChart } from "@nocoo/basalt/charts/bar";
import { ChartFrame, ChartShell } from "@nocoo/basalt/charts/frame";
import { Gauge } from "@nocoo/basalt/charts/gauge";
import { HeatmapCalendar, heatmapColorScales } from "@nocoo/basalt/charts/heatmap-calendar";
import { LineChart } from "@nocoo/basalt/charts/line";
import { StatCard } from "@nocoo/basalt/charts/stat-card";
import { Button } from "@nocoo/basalt/components/button";
import { ChatBubble } from "@nocoo/basalt/components/chat-bubble";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import { type BasaltTheme, ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";
import { HelpCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart as RechartsBar } from "recharts";

const BAR_DATA = [
	{ x: "Q1", y: 120 },
	{ x: "Q2", y: 240 },
	{ x: "Q3", y: 180 },
	{ x: "Q4", y: 320 },
];

const LINE_DATA = [
	{ x: "Jan", y: 45 },
	{ x: "Feb", y: 52 },
	{ x: "Mar", y: 58 },
	{ x: "Apr", y: 65 },
];

interface MultiLatencyPoint {
	x: string;
	p95US: number;
	p95EU: number;
	p95APAC: number;
	deltaAnomaly: number;
	targetSLA: number;
}

const DYNAMIC_MULTI_DATA: MultiLatencyPoint[] = [
	{ x: "10:00", p95US: 45, p95EU: 52, p95APAC: 110, deltaAnomaly: -12, targetSLA: 100 },
	{ x: "11:00", p95US: 48, p95EU: 58, p95APAC: 135, deltaAnomaly: 25, targetSLA: 100 },
	{ x: "12:00", p95US: 52, p95EU: 64, p95APAC: 142, deltaAnomaly: 32, targetSLA: 100 },
	{ x: "13:00", p95US: 46, p95EU: 50, p95APAC: 98, deltaAnomaly: -8, targetSLA: 100 },
	{ x: "14:00", p95US: 44, p95EU: 49, p95APAC: 92, deltaAnomaly: -15, targetSLA: 100 },
];

const RATIO_STACK_DATA = [
	{ x: "Start", p95US: 10, p95EU: 20 },
	{ x: "End", p95US: 100, p95EU: 200 },
];

const RATIO_SERIES = [
	{ key: "p95US" as const, label: "US Region", color: "hsl(var(--basalt-chart-1))" },
	{ key: "p95EU" as const, label: "EU Region", color: "hsl(var(--basalt-chart-2))" },
];

const MULTI_SERIES = [
	{ key: "p95US" as const, label: "US Region", color: "hsl(var(--basalt-chart-1))" },
	{ key: "p95EU" as const, label: "EU Region", color: "hsl(var(--basalt-chart-2))" },
	{ key: "p95APAC" as const, label: "APAC Region", color: "hsl(var(--basalt-chart-3))" },
	{ key: "deltaAnomaly" as const, label: "SLA Variance", color: "hsl(var(--basalt-chart-4))" },
	{ key: "targetSLA" as const, label: "SLA Target", color: "hsl(var(--basalt-chart-5))" },
];

function ChartsPanel() {
	const { theme, setTheme } = useTheme();
	const [valuesData, setValuesData] = useState<number[]>([0, 1, 2, 3, 4, 1, 0, 2, 3, 4]);
	const [statState, setStatState] = useState<"ready" | "error">("error");
	const [activeMultiKeys, setActiveMultiKeys] = useState<Set<string>>(
		new Set(["p95US", "p95EU", "p95APAC", "deltaAnomaly", "targetSLA"]),
	);
	const [dynamicStackOffset, setDynamicStackOffset] = useState<"none" | "expand">("none");

	return (
		<div id="charts-container" style={{ padding: 16 }}>
			<style>{`
				.consumer-chart-plot {
					height: 192px;
					width: 100%;
				}
				.consumer-chart-plot-static {
					height: 160px;
					width: 100%;
				}
			`}</style>
			<nav style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
				<label>
					Theme:{" "}
					<select
						id="select-chart-theme"
						aria-label="Select Theme"
						value={theme}
						onChange={(e) => setTheme(e.target.value as BasaltTheme)}
					>
						<option value="light">light</option>
						<option value="dark">dark</option>
					</select>
				</label>
				<span id="charts-ready" data-ready="true">
					Ready: {theme}
				</span>
			</nav>

			<section style={{ display: "grid", gap: 32 }}>
				{/* 1. BarChart with keyboard exploration, summary, and dataAlternative */}
				<div data-testid="case-bar-accessible">
					<h2>Quarterly Revenue (Accessible Bar)</h2>
					<button id="focus-before-bar" type="button">
						Focus Before Bar
					</button>
					<BarChart
						data={BAR_DATA}
						showAxes
						ariaLabel="Quarterly revenue bar chart"
						className="consumer-chart-plot"
						summary="Revenue grew steadily across four quarters reaching a high of 320k in Q4. Press Tab to focus the plot and use arrow keys to explore."
						dataAlternative={
							<details id="details-bar-data">
								<summary>View quarterly revenue table</summary>
								<table aria-label="Quarterly revenue breakdown">
									<thead>
										<tr>
											<th scope="col">Quarter</th>
											<th scope="col">Revenue</th>
										</tr>
									</thead>
									<tbody>
										{BAR_DATA.map((row) => (
											<tr key={row.x}>
												<td>{row.x}</td>
												<td>{row.y}</td>
											</tr>
										))}
									</tbody>
								</table>
							</details>
						}
					/>
				</div>

				{/* 2. LineChart with keyboard exploration and summary */}
				<div data-testid="case-line-accessible">
					<h2>Monthly Retention (Accessible Line)</h2>
					<button id="focus-before-line" type="button">
						Focus Before Line
					</button>
					<LineChart
						data={LINE_DATA}
						showAxes
						ariaLabel="Monthly retention line chart"
						className="consumer-chart-plot"
						summary="Monthly retention rose from 45% in January to 65% in April."
						dataAlternative={
							<details id="details-line-data">
								<summary>View monthly retention table</summary>
								<table aria-label="Monthly retention data">
									<thead>
										<tr>
											<th scope="col">Month</th>
											<th scope="col">Rate</th>
										</tr>
									</thead>
									<tbody>
										{LINE_DATA.map((row) => (
											<tr key={row.x}>
												<td>{row.x}</td>
												<td>{row.y}%</td>
											</tr>
										))}
									</tbody>
								</table>
							</details>
						}
					/>
				</div>

				{/* 3. Explicit accessibilityLayer={false} on wrapper */}
				<div data-testid="case-bar-disabled-layer">
					<h2>Static Bar Chart</h2>
					<BarChart
						data={BAR_DATA}
						ariaLabel="Static quarterly bar chart"
						accessibilityLayer={false}
						className="consumer-chart-plot-static"
						summary="Static presentation of quarterly metrics."
						dataAlternative={<p id="static-bar-alt">Static data alternative text.</p>}
					/>
				</div>

				{/* 4. ChartFrame with explicit child Recharts accessibilityLayer={false} */}
				<div data-testid="case-frame-child-false">
					<h2>ChartFrame Child Layer False</h2>
					<ChartFrame
						ariaLabel="Frame child disabled layer"
						className="consumer-chart-plot-static"
						summary="Frame summary text."
					>
						<RechartsBar data={BAR_DATA} accessibilityLayer={false}>
							<Bar dataKey="y" />
						</RechartsBar>
					</ChartFrame>
				</div>

				{/* 5. ChartShell with legend and dataAlternative */}
				<div data-testid="case-shell-legend">
					<h2>ChartShell With Legend & Data Alternative</h2>
					<ChartShell
						ariaLabel="Shell with legend and alternative"
						className="consumer-chart-plot"
						legend={<div id="shell-legend-node">Legend: Q1 to Q4</div>}
						summary="ChartShell summary for compound display."
						dataAlternative={
							<details id="details-shell-data">
								<summary>View shell alternative data</summary>
								<table aria-label="Shell alternative table">
									<tbody>
										<tr>
											<td>Data Point</td>
											<td>Value</td>
										</tr>
									</tbody>
								</table>
							</details>
						}
					>
						<RechartsBar data={BAR_DATA}>
							<Bar dataKey="y" />
						</RechartsBar>
					</ChartShell>
				</div>

				{/* 6. Gauge with summary, center value, and dataAlternative */}
				<div data-testid="case-gauge-accessible">
					<h2>System Load Gauge</h2>
					<Gauge
						value={72}
						max={100}
						ariaLabel="System load gauge"
						className="h-36 w-36"
						summary="Current system load is at 72% within normal bounds."
						dataAlternative={<p id="gauge-alt">Load is 72 out of 100 maximum capacity.</p>}
					/>
				</div>

				{/* 7. HeatmapCalendar: Year grid with keyboard traversal */}
				<div data-testid="case-heatmap-year">
					<h2>Repository Commits (Heatmap Calendar)</h2>
					<button id="focus-before-heatmap" type="button">
						Focus Before Heatmap
					</button>
					<HeatmapCalendar
						data={[
							{ date: "2026-01-01", value: 5 },
							{ date: "2026-01-02", value: 12 },
							{ date: "2026-12-31", value: 9 },
						]}
						year={2026}
						colorScale={heatmapColorScales.blue}
						metricLabel="Commits"
						ariaLabel="Repository commits"
						valueFormatter={(value) => `${value} commits`}
					/>
					<button id="focus-after-heatmap" type="button">
						Focus After Heatmap
					</button>
				</div>

				{/* 8. HeatmapCalendar: Values matrix with dynamic shrink & empty */}
				<div data-testid="case-heatmap-values">
					<h2>Values Matrix</h2>
					<div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
						<button id="values-shrink-btn" type="button" onClick={() => setValuesData([0, 3])}>
							Shrink to 2
						</button>
						<button id="values-empty-btn" type="button" onClick={() => setValuesData([])}>
							Empty Values
						</button>
						<button
							id="values-restore-btn"
							type="button"
							onClick={() => setValuesData([0, 1, 2, 3, 4, 1, 0, 2, 3, 4])}
						>
							Restore Values
						</button>
						<button id="outside-focus-btn" type="button">
							Outside Button
						</button>
					</div>
					<button id="focus-before-values" type="button">
						Focus Before Values
					</button>
					<HeatmapCalendar values={valuesData} ariaLabel="Matrix activity" />
					<button id="focus-after-values" type="button">
						Focus After Values
					</button>
				</div>

				{/* 9. StatCard: Real Tooltip action & error -> Retry -> ready state transition */}
				<div data-testid="case-statcard-interactive">
					<h2>KPI Metrics</h2>
					<div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
						<button id="statcard-set-error" type="button" onClick={() => setStatState("error")}>
							Set Error State
						</button>
						<button id="statcard-set-ready" type="button" onClick={() => setStatState("ready")}>
							Set Ready State
						</button>
					</div>
					<button id="focus-before-statcard" type="button">
						Focus Before StatCard
					</button>
					<StatCard
						title="Active Subscriptions"
						value={1420}
						subtitle={statState === "error" ? undefined : "Verified active licenses"}
						trend={statState === "ready" ? { value: 8.5, label: "vs last month" } : undefined}
						status={
							statState === "error" ? (
								<span
									id="statcard-error-status"
									className="text-sm font-medium text-basalt-destructive"
								>
									Cluster query failed
								</span>
							) : undefined
						}
						action={
							statState === "error" ? (
								<Button
									id="statcard-retry-btn"
									size="sm"
									variant="outline"
									className="h-7 text-xs"
									onClick={() => setStatState("ready")}
								>
									<RefreshCw className="h-3 w-3 mr-1" />
									Retry
								</Button>
							) : (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											id="statcard-action-btn"
											size="sm"
											variant="ghost"
											className="h-6 w-6"
											aria-label="Subscription methodology"
										>
											<HelpCircle className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p id="statcard-tooltip-text">
											Accounts with at least one active seat renewed in the last 30 days.
										</p>
									</TooltipContent>
								</Tooltip>
							)
						}
					/>
					<button id="focus-after-statcard" type="button">
						Focus After StatCard
					</button>
				</div>

				{/* 10. Reduced Motion verification fixtures: Button loading & ChatBubble streaming */}
				<div data-testid="case-reduced-motion">
					<h2>Reduced Motion Feedback</h2>
					<div className="flex flex-col gap-3">
						<Button id="rm-button-loading" loading>
							Saving Telemetry
						</Button>
						<div id="rm-chat-bubble">
							<ChatBubble variant="assistant" streaming>
								Processing query results
							</ChatBubble>
						</div>
					</div>
				</div>

				{/* 11. Dynamic Multi-Series (>3 keys) LineChart & AreaChart verification */}
				<div data-testid="case-dynamic-series">
					<h2>Dynamic Multi-Series Telemetry</h2>
					<div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
						<button
							id="btn-toggle-sla-variance"
							type="button"
							onClick={() => {
								setActiveMultiKeys((prev) => {
									const next = new Set(prev);
									if (next.has("deltaAnomaly")) next.delete("deltaAnomaly");
									else next.add("deltaAnomaly");
									return next;
								});
							}}
						>
							Toggle SLA Variance
						</button>
						<button
							id="btn-toggle-stack-expand"
							type="button"
							onClick={() => {
								setDynamicStackOffset((prev) => (prev === "expand" ? "none" : "expand"));
							}}
						>
							Toggle Stack Expand
						</button>
					</div>

					<button id="focus-before-dynamic-line" type="button">
						Focus Before Dynamic Line
					</button>
					<LineChart
						data={DYNAMIC_MULTI_DATA}
						series={MULTI_SERIES.filter((s) => activeMultiKeys.has(s.key))}
						showAxes
						ariaLabel="Multi-region latency dynamic line"
						className="consumer-chart-plot"
						xValueFormatter={(x) => `${String(x)} CST`}
						valueFormatter={(v) => `${v}ms`}
						yDomain={[-20, 160]}
						legend={() => (
							<div
								id="dynamic-legend-slot"
								role="group"
								aria-label="Multi-region latency series controls"
								style={{ display: "flex", gap: 12, marginTop: 8 }}
							>
								{MULTI_SERIES.map((item) => {
									const isActive = activeMultiKeys.has(item.key);
									return (
										<button
											key={item.key}
											id={`dynamic-legend-btn-${item.key}`}
											type="button"
											aria-pressed={isActive}
											onClick={() => {
												setActiveMultiKeys((prev) => {
													const next = new Set(prev);
													if (next.has(item.key)) next.delete(item.key);
													else next.add(item.key);
													return next;
												});
											}}
										>
											{item.label}
										</button>
									);
								})}
							</div>
						)}
						customTooltip={({ active, payload, label }) => {
							if (!active || !payload?.length) return null;
							return (
								<div id="dynamic-custom-tooltip" data-testid="dynamic-custom-tooltip">
									<p id="dynamic-tooltip-title">{String(label)}</p>
									<div id="dynamic-tooltip-items">
										{payload.map((entry) => (
											<span key={entry.dataKey} data-key={entry.dataKey} data-value={entry.value}>
												{entry.name}: {entry.value}ms
											</span>
										))}
									</div>
								</div>
							);
						}}
					/>

					<div id="dynamic-stack-area">
						<AreaChart
							data={RATIO_STACK_DATA}
							series={RATIO_SERIES}
							stacked
							stackOffset={dynamicStackOffset === "expand" ? "expand" : undefined}
							yDomain={dynamicStackOffset === "expand" ? [0, 1] : undefined}
							showAxes
							ariaLabel="Multi-region latency dynamic area"
							className="consumer-chart-plot"
							valueFormatter={(v) =>
								dynamicStackOffset === "expand" ? `${(v * 100).toFixed(0)}%` : `${v}ms`
							}
						/>
					</div>
				</div>
			</section>
		</div>
	);
}

export function ChartsApp() {
	return (
		<ThemeProvider defaultTheme="light">
			<TooltipProvider>
				<ChartsPanel />
			</TooltipProvider>
		</ThemeProvider>
	);
}
