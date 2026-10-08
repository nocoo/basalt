import { DonutChart } from "@nocoo/basalt/charts/donut";
import { LineChart } from "@nocoo/basalt/charts/line";
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
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import { formatPercent, formatUsd } from "@/lib/format";
import { CHART_COLORS, CHART_TOKENS, withAlpha } from "@/lib/palette";
import { usePortfolioViewModel } from "@/viewmodels/usePortfolioViewModel";

export default function PortfolioPage() {
	const { t } = useTranslation();
	const { totalValue, holdings, performanceData } = usePortfolioViewModel();

	return (
		<ShowcasePage title={t("pages.portfolio.title")} description={t("pages.portfolio.description")}>
			<div className="grid grid-cols-1 gap-basalt-layout md:gap-basalt-layout sm:grid-cols-3">
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.portfolio.portfolioValue")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-foreground font-display tracking-tight">
						${totalValue.toLocaleString()}
					</p>
					<span className="text-basalt-sm font-medium text-success">
						{t("pages.portfolio.allTime")}
					</span>
				</LayerCard>
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.portfolio.todaysChange")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-success font-display tracking-tight">
						+$342.50
					</p>
					<span className="text-basalt-sm font-medium text-success">+0.34%</span>
				</LayerCard>
				<LayerCard>
					<p className="text-basalt-sm md:text-basalt-base text-muted-foreground mb-basalt-space-sm">
						{t("pages.portfolio.totalReturn")}
					</p>
					<p className="text-basalt-2xl md:text-basalt-3xl font-semibold text-foreground font-display tracking-tight">
						$8,600
					</p>
					<span className="text-basalt-sm font-medium text-success">+8.6%</span>
				</LayerCard>
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.portfolio.portfolioPerformance")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<LineChart
							data={performanceData.map((row) => ({ x: row.month, y: row.value }))}
							series={[{ key: "y", label: t("pages.portfolio.value") }]}
							ariaLabel={t("pages.portfolio.performanceAria")}
							className="h-[11.25rem] w-full md:h-[12.5rem]"
							showAxes
							valueFormatter={formatUsd}
						/>
					</LayerCard.Body>
				</LayerCard>

				<LayerCard>
					<LayerCard.Header className="items-center justify-start">
						<PieChartIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base text-muted-foreground">
							{t("pages.portfolio.assetAllocation")}
						</h2>
					</LayerCard.Header>
					<LayerCard.Body className="flex flex-col items-center">
						<DonutChart
							data={holdings.map((item) => ({ name: item.name, value: item.allocation }))}
							ariaLabel={t("pages.portfolio.allocationAria")}
							className="h-[10rem] w-[10rem] md:h-[11.25rem] md:w-[11.25rem]"
							valueFormatter={formatPercent}
						/>
						<div className="mt-basalt-space-lg grid w-full grid-cols-3 gap-x-basalt-space-lg gap-y-basalt-space-lg">
							{holdings.map((item, i) => (
								<div key={item.name} className="flex flex-col items-center gap-basalt-space-xs">
									<span className="text-basalt-base font-medium text-foreground font-display">
										{item.allocation}%
									</span>
									<div className="flex items-center gap-basalt-space-md">
										<div
											className="h-2 w-2 rounded-basalt-full"
											style={{ background: CHART_COLORS[i] }}
										/>
										<span className="text-basalt-sm text-muted-foreground">{item.name}</span>
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
						className="h-4 w-4 text-muted-foreground"
						strokeWidth={1.5}
						aria-hidden="true"
					/>
					<h2 className="text-basalt-base text-muted-foreground">
						{t("pages.portfolio.holdings")}
					</h2>
				</LayerCard.Header>
				<LayerCard.Body>
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
										<div className="flex items-center gap-basalt-space-lg">
											<div
												className="flex h-8 w-8 items-center justify-center rounded-basalt-md"
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
				</LayerCard.Body>
			</LayerCard>
		</ShowcasePage>
	);
}
