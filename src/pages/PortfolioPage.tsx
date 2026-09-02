import { DonutChart } from "@nocoo/basalt/charts/donut";
import { LineChart } from "@nocoo/basalt/charts/line";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { Briefcase, PieChart as PieChartIcon, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPercent, formatUsd } from "@/lib/format";
import { CHART_COLORS, CHART_TOKENS, withAlpha } from "@/lib/palette";
import { usePortfolioViewModel } from "@/viewmodels/usePortfolioViewModel";

export default function PortfolioPage() {
	const { t } = useTranslation();
	const { totalValue, holdings, performanceData } = usePortfolioViewModel();

	return (
		<>
			<div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-3">
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.portfolio.portfolioValue")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-foreground font-display tracking-tight">
						${totalValue.toLocaleString()}
					</h2>
					<span className="text-xs font-medium text-success">{t("pages.portfolio.allTime")}</span>
				</div>
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.portfolio.todaysChange")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-success font-display tracking-tight">
						+$342.50
					</h2>
					<span className="text-xs font-medium text-success">+0.34%</span>
				</div>
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<p className="text-xs md:text-sm text-muted-foreground mb-1">
						{t("pages.portfolio.totalReturn")}
					</p>
					<h2 className="text-xl md:text-2xl font-semibold text-foreground font-display tracking-tight">
						$8,600
					</h2>
					<span className="text-xs font-medium text-success">+8.6%</span>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
				<div className="rounded-card bg-secondary p-4 md:p-5">
					<div className="flex items-center gap-2 mb-4">
						<TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<p className="text-sm text-muted-foreground">
							{t("pages.portfolio.portfolioPerformance")}
						</p>
					</div>
					<LineChart
						data={performanceData.map((row) => ({ x: row.month, y: row.value }))}
						series={[{ key: "y", label: t("pages.portfolio.value") }]}
						ariaLabel={t("pages.portfolio.performanceAria")}
						className="h-[180px] w-full md:h-[200px]"
						showAxes
						valueFormatter={formatUsd}
					/>
				</div>

				<div className="rounded-card bg-secondary p-4 md:p-5">
					<div className="flex items-center gap-2 mb-4">
						<PieChartIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<p className="text-sm text-muted-foreground">{t("pages.portfolio.assetAllocation")}</p>
					</div>
					<div className="flex flex-col items-center">
						<DonutChart
							data={holdings.map((item) => ({ name: item.name, value: item.allocation }))}
							ariaLabel={t("pages.portfolio.allocationAria")}
							className="h-[160px] w-[160px] md:h-[180px] md:w-[180px]"
							valueFormatter={formatPercent}
						/>
						<div className="mt-4 grid w-full grid-cols-3 gap-x-4 gap-y-3">
							{holdings.map((item, i) => (
								<div key={item.name} className="flex flex-col items-center gap-0.5">
									<span className="text-sm font-medium text-foreground font-display">
										{item.allocation}%
									</span>
									<div className="flex items-center gap-1.5">
										<div className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
										<span className="text-xs text-muted-foreground">{item.name}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="mt-4 rounded-card bg-secondary p-4 md:p-5">
				<div className="flex items-center gap-2 mb-4">
					<Briefcase
						className="h-4 w-4 text-muted-foreground"
						strokeWidth={1.5}
						aria-hidden="true"
					/>
					<p className="text-sm text-muted-foreground">{t("pages.portfolio.holdings")}</p>
				</div>
				<Table aria-label={t("pages.portfolio.holdings")}>
					<TableHeader>
						<TableRow>
							<TableHead>{t("pages.portfolio.asset")}</TableHead>
							<TableHead className="text-right">{t("pages.portfolio.value")}</TableHead>
							<TableHead className="text-right">{t("pages.portfolio.change")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{holdings.map((item, i) => (
							<TableRow key={item.name}>
								<TableCell>
									<div className="flex items-center gap-3">
										<div
											className="flex h-8 w-8 items-center justify-center rounded-lg"
											style={{ background: withAlpha(CHART_TOKENS[i], 0.12) }}
										>
											{item.up ? (
												<TrendingUp
													className="h-3.5 w-3.5"
													style={{ color: CHART_COLORS[i] }}
													strokeWidth={1.5}
													aria-hidden="true"
												/>
											) : (
												<TrendingDown
													className="h-3.5 w-3.5"
													style={{ color: CHART_COLORS[i] }}
													strokeWidth={1.5}
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
									className={`text-right ${item.up ? "text-success" : "text-destructive"}`}
								>
									{item.change}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	);
}
