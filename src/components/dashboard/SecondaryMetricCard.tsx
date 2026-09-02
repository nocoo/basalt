import { BarChart } from "@nocoo/basalt/charts/bar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatUsd } from "@/lib/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INCOME = [3200, 3480, 3610, 3390, 3720, 4010, 3880, 4150, 4090, 4280, 4360, 4500];

export function SecondaryMetricCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<TrendingUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">{t("dashboard.income")}</h3>
				</div>
				<div className="flex items-baseline gap-3">
					<h2 className="text-3xl font-semibold text-foreground font-display tracking-tight">
						$4,500
					</h2>
					<span className="text-sm font-medium text-success font-display">+2.4%</span>
					<span className="text-sm text-muted-foreground">{t("common.vsLastMonth")}</span>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<BarChart
					data={MONTHS.map((month, index) => ({ x: month, y: INCOME[index] ?? 0 }))}
					series={[{ key: "y", label: t("dashboard.income") }]}
					ariaLabel={t("dashboard.incomeAria")}
					className="min-h-[50px] w-full flex-1"
					valueFormatter={formatUsd}
				/>
			</div>
		</LayerCard>
	);
}
