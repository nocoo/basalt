import { LineChart } from "@nocoo/basalt/charts/line";
import { StatCard } from "@nocoo/basalt/charts/stat-card";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatUsd } from "@/lib/format";

const HOURS = [
	"00:00",
	"02:00",
	"04:00",
	"06:00",
	"08:00",
	"10:00",
	"12:00",
	"14:00",
	"16:00",
	"18:00",
	"20:00",
	"22:00",
];
const BALANCE = [8120, 8090, 8060, 8180, 8340, 8510, 8680, 8740, 8690, 8610, 8540, 8800];
const DATA = HOURS.map((x, index) => ({ x, y: BALANCE[index] }));

export function SummaryMetricCard() {
	const { t } = useTranslation();
	return (
		<StatCard
			title={t("dashboard.totalBalance")}
			value="$8,800"
			icon={Globe}
			trend={{ value: 3.1, label: t("common.vsLastMonth") }}
		>
			<div className="space-y-basalt-space-lg">
				<LineChart
					data={DATA}
					series={[{ key: "y", label: t("dashboard.totalBalance") }]}
					ariaLabel={t("dashboard.totalBalanceAria")}
					className="h-basalt-16 w-full"
					valueFormatter={formatUsd}
					yDomain={[8000, 9000]}
				/>
				<p className="text-basalt-sm text-basalt-muted-foreground">
					{t("dashboard.balancePeriod")}
				</p>
			</div>
		</StatCard>
	);
}
