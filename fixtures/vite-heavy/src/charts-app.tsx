import { BarChart } from "@nocoo/basalt/charts/bar";
import { ChartFrame, ChartShell } from "@nocoo/basalt/charts/frame";
import { Gauge } from "@nocoo/basalt/charts/gauge";
import { HeatmapCalendar, heatmapColorScales } from "@nocoo/basalt/charts/heatmap-calendar";
import { LineChart } from "@nocoo/basalt/charts/line";
import { type BasaltTheme, ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";
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

function ChartsPanel() {
	const { theme, setTheme } = useTheme();
	const [valuesData, setValuesData] = useState<number[]>([0, 1, 2, 3, 4, 1, 0, 2, 3, 4]);

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
			</section>
		</div>
	);
}

export function ChartsApp() {
	return (
		<ThemeProvider defaultTheme="light">
			<ChartsPanel />
		</ThemeProvider>
	);
}
