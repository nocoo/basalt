import { Badge } from "@nocoo/basalt/components/badge";
import { CHART_COLORS, withAlpha } from "@nocoo/basalt/components/chart";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { Briefcase, PieChart as PieChartIcon, TrendingDown, TrendingUp } from "lucide-react";
import { DonutChart } from "@/components/charts/donut";
import { LineChart } from "@/components/charts/line";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatPercent, formatUsd } from "@/lib/format";
import { usePortfolioViewModel } from "@/viewmodels/usePortfolioViewModel";

const PORTFOLIO_CHART_TOKENS = ["chart-1", "chart-2", "chart-5", "chart-7", "chart-24"] as const;

export default function PortfolioPage() {
	const { totalValue, holdings, performanceData } = usePortfolioViewModel();

	return (
		<ShowcasePage
			title="Care fund allocation"
			description="Treatment fund allocation, funding trends, and available reserves. Sample data, not a live service."
		>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-basalt-layout sm:grid-cols-3">
				<LayerCard>
					<p className="text-basalt-base font-medium text-basalt-muted-foreground mb-basalt-space-sm">
						Portfolio Value
					</p>
					<p className="text-basalt-3xl font-semibold text-basalt-foreground font-basalt-display tracking-tight">
						${totalValue.toLocaleString()}
					</p>
					<Badge tone="success">+8.6% all time</Badge>
				</LayerCard>
				<LayerCard>
					<p className="text-basalt-base font-medium text-basalt-muted-foreground mb-basalt-space-sm">
						Today's Change
					</p>
					<p className="text-basalt-3xl font-semibold text-basalt-success font-basalt-display tracking-tight">
						+$342.50
					</p>
					<span className="text-basalt-sm font-medium text-basalt-success">+0.34%</span>
				</LayerCard>
				<LayerCard>
					<p className="text-basalt-base font-medium text-basalt-muted-foreground mb-basalt-space-sm">
						Total Return
					</p>
					<p className="text-basalt-3xl font-semibold text-basalt-foreground font-basalt-display tracking-tight">
						$8,600
					</p>
					<span className="text-basalt-sm font-medium text-basalt-success">+8.6%</span>
				</LayerCard>
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<TrendingUp className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
							Portfolio Performance
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<LineChart
							data={performanceData.map((row) => ({
								x: row.month,
								y: row.value,
							}))}
							series={[{ key: "y", label: "Value" }]}
							ariaLabel="Portfolio performance line chart over time"
							className="h-[11.25rem] w-full md:h-[12.5rem]"
							showAxes
							valueFormatter={formatUsd}
						/>
						<p className="text-basalt-sm text-basalt-muted-foreground">
							Sample trend is separate from current holdings.
						</p>
					</LayerCard.Body>
				</LayerCard>

				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<PieChartIcon className="size-basalt-icon-lg text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
							Asset Allocation
						</h2>
					</LayerCard.Header>
					<LayerCard.Body className="flex flex-col items-center">
						<DonutChart
							data={holdings.map((item) => ({ name: item.name, value: item.allocation }))}
							ariaLabel="Asset allocation donut chart"
							className="h-[10rem] w-[10rem] md:h-[11.25rem] md:w-[11.25rem]"
							valueFormatter={formatPercent}
						/>
						<div className="mt-basalt-card-sm grid w-full grid-cols-3 gap-basalt-card-sm">
							{holdings.map((item, i) => (
								<div key={item.name} className="flex flex-col items-center gap-basalt-space-xs">
									<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display">
										{item.allocation}%
									</span>
									<div className="flex items-center gap-basalt-space-md">
										<div
											className="h-2 w-2 rounded-basalt-full"
											style={{ background: CHART_COLORS[i] }}
										/>
										<span className="text-basalt-sm text-basalt-muted-foreground">{item.name}</span>
									</div>
								</div>
							))}
						</div>
					</LayerCard.Body>
				</LayerCard>
			</div>

			<LayerCard>
				<LayerCard.Header className="items-center justify-start">
					<Briefcase
						className="size-basalt-icon-lg text-basalt-muted-foreground"
						aria-hidden="true"
					/>
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Holdings</h2>
				</LayerCard.Header>
				<LayerCard.Body>
					<div
						role="region"
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
						tabIndex={0}
						aria-label="Holdings table, scroll horizontally"
						className="overflow-x-auto basalt-focus basalt-focus-inset"
					>
						<Table aria-label="Holdings">
							<TableHeader>
								<TableRow>
									<TableHead>Asset</TableHead>
									<TableHead className="text-right">Value</TableHead>
									<TableHead className="text-right">Change</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{holdings.map((item, i) => (
									<TableRow key={item.name}>
										<TableCell>
											<div className="flex items-center gap-basalt-space-lg">
												<div
													className="flex h-8 w-8 items-center justify-center rounded-basalt-md"
													style={{ background: withAlpha(PORTFOLIO_CHART_TOKENS[i], 0.12) }}
												>
													{item.up ? (
														<TrendingUp
															className="size-basalt-icon"
															style={{ color: CHART_COLORS[i] }}
															aria-hidden="true"
														/>
													) : (
														<TrendingDown
															className="size-basalt-icon"
															style={{ color: CHART_COLORS[i] }}
															aria-hidden="true"
														/>
													)}
												</div>
												{item.name}
											</div>
										</TableCell>
										<TableCell className="text-right font-medium">
											${item.value.toLocaleString()}
										</TableCell>
										<TableCell
											className={`text-right ${item.up ? "text-basalt-success" : "text-basalt-danger-solid"}`}
										>
											{item.change}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<p className="mt-basalt-card-sm text-basalt-sm text-basalt-muted-foreground">
						Changes: vs. prior 30 days
					</p>
				</LayerCard.Body>
			</LayerCard>
		</ShowcasePage>
	);
}
