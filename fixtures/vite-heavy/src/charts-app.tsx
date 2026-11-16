import { Button } from "@nocoo/basalt/components/button";
import {
	CHART_COLORS,
	ChartFrame,
	ChartLegend,
	ChartTooltipContent,
	chartAxis,
	chartTextStyle,
	chartTooltipProps,
} from "@nocoo/basalt/components/chart";
import { StatCard } from "@nocoo/basalt/components/stat-card";
import { Activity } from "@nocoo/basalt/icons";
import { type BasaltTheme, ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const DATA = [
	{ quarter: "Q1", revenue: 120 },
	{ quarter: "Q2", revenue: 240 },
	{ quarter: "Q3", revenue: 180 },
	{ quarter: "Q4", revenue: 320 },
];
const SERIES = [{ key: "revenue", label: "Revenue", color: CHART_COLORS[0] }];

function CustomSvg({ ariaLabel }: { ariaLabel: string }) {
	return (
		<svg viewBox="0 0 120 48" role="img" aria-label={ariaLabel} className="h-full w-full">
			<path
				d="M4 44 28 30 52 36 76 16 116 6"
				fill="none"
				stroke={CHART_COLORS[1]}
				strokeWidth="3"
			/>
			<circle cx="116" cy="6" r="3" fill={CHART_COLORS[1]} />
		</svg>
	);
}

function ChartsPanel() {
	const { theme, setTheme } = useTheme();
	const [active, setActive] = useState(1420);
	const tooltipProps = chartTooltipProps({ formatter: (value) => `$${value}k`, cursor: "bar" });

	return (
		<main id="charts-container" className="p-basalt-card">
			<nav className="mb-basalt-layout flex items-center gap-basalt-layout">
				<label>
					Theme:{" "}
					<select
						id="select-chart-theme"
						aria-label="Select Theme"
						value={theme}
						onChange={(event) => setTheme(event.target.value as BasaltTheme)}
					>
						<option value="light">light</option>
						<option value="dark">dark</option>
					</select>
				</label>
				<span id="charts-ready" data-ready="true">
					Ready: {theme}
				</span>
			</nav>

			<section className="flex flex-col gap-basalt-layout">
				<div data-testid="case-recharts">
					<button id="focus-before-chart" type="button">
						Focus Before Chart
					</button>
					<ChartFrame
						ariaLabel="Quarterly revenue"
						size="h-basalt-36 w-full"
						summary="Revenue grew from $120k in Q1 to $320k in Q4."
						legend={<ChartLegend items={SERIES} shape="bar" />}
						dataAlternative={
							<details id="details-recharts-data">
								<summary>View quarterly revenue table</summary>
								<table aria-label="Quarterly revenue data">
									<thead>
										<tr>
											<th scope="col">Quarter</th>
											<th scope="col">Revenue</th>
										</tr>
									</thead>
									<tbody>
										{DATA.map((row) => (
											<tr key={row.quarter}>
												<td>{row.quarter}</td>
												<td>{row.revenue}</td>
											</tr>
										))}
									</tbody>
								</table>
							</details>
						}
					>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={DATA} accessibilityLayer aria-label="Quarterly revenue chart">
								<XAxis dataKey="quarter" stroke={chartAxis} tick={chartTextStyle("axis")} />
								<YAxis stroke={chartAxis} tick={chartTextStyle("axis")} />
								<Tooltip
									{...tooltipProps}
									content={(props) => (
										<ChartTooltipContent
											active={props.active}
											label={String(props.label ?? "")}
											payload={props.payload?.map((item) => ({
												name: item.name === undefined ? undefined : String(item.name),
												value:
													typeof item.value === "string" || typeof item.value === "number"
														? item.value
														: item.value?.join(", "),
												color: item.color,
												fill: item.fill,
												stroke: item.stroke,
												dataKey:
													typeof item.dataKey === "string" || typeof item.dataKey === "number"
														? item.dataKey
														: undefined,
											}))}
											formatter={(value) => `$${value}k`}
										/>
									)}
								/>
								<Bar dataKey="revenue" fill={CHART_COLORS[0]} isAnimationActive={false} />
							</BarChart>
						</ResponsiveContainer>
					</ChartFrame>
				</div>

				<div data-testid="case-custom-svg">
					<ChartFrame
						ariaLabel="Custom SVG trend"
						size="w-1/2 h-basalt-36"
						className="p-basalt-card"
						legend={
							<ChartLegend items={[{ ...SERIES[0], label: "Trend", color: CHART_COLORS[1] }]} />
						}
					>
						<CustomSvg ariaLabel="Custom SVG plot" />
					</ChartFrame>
				</div>

				<div data-testid="case-stat-card">
					<StatCard
						title="Active subscriptions"
						value={active}
						icon={<Activity />}
						trend={{ value: 8.5, label: "vs last month" }}
						action={
							<Button
								id="stat-refresh"
								size="sm"
								variant="outline"
								onClick={() => setActive((value) => value + 1)}
							>
								Refresh
							</Button>
						}
					>
						<CustomSvg ariaLabel="Subscription trend" />
					</StatCard>
				</div>

				<div data-testid="case-reduced-motion">
					<Button id="loading-button" loading>
						Saving Telemetry
					</Button>
				</div>
			</section>
		</main>
	);
}

export function ChartsApp() {
	return (
		<ThemeProvider defaultTheme="light">
			<ChartsPanel />
		</ThemeProvider>
	);
}
