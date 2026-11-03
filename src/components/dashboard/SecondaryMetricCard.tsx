import { BarChart } from "@nocoo/basalt/charts/bar";
import { StatCard } from "@nocoo/basalt/charts/stat-card";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatUsd } from "@/lib/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INCOME = [3200, 3480, 3610, 3390, 3720, 4010, 3880, 4150, 4090, 4280, 4360, 4500];
const DATA = MONTHS.map((x, index) => ({ x, y: INCOME[index] }));

export function SecondaryMetricCard() {
	const { t } = useTranslation();
	const current = INCOME[INCOME.length - 1];
	const previous = INCOME[INCOME.length - 2];
	const change = Math.round(((current - previous) / previous) * 1000) / 10;
	return (
		<StatCard
			title={t("dashboard.income")}
			value={formatUsd(current)}
			icon={TrendingUp}
			trend={{ value: change, label: t("common.vsLastMonth") }}
		>
			<div className="space-y-basalt-card-sm">
				<BarChart
					data={DATA.map((row) => ({ ...row, x: t(`dashboard.months.${row.x.toLowerCase()}`) }))}
					series={[{ key: "y", label: t("dashboard.income") }]}
					ariaLabel={t("dashboard.incomeAria")}
					className="h-basalt-16 w-full"
					valueFormatter={formatUsd}
				/>
				<p className="text-basalt-sm text-basalt-muted-foreground">{t("dashboard.incomePeriod")}</p>
			</div>
		</StatCard>
	);
}
