import { LineChart } from "@nocoo/basalt/charts/line";
import { StatCard } from "@nocoo/basalt/charts/stat-card";
import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatUsd } from "@/lib/format";

const DATA = [
	{ x: "Mon", y: 2400 },
	{ x: "Tue", y: 1398 },
	{ x: "Wed", y: 5800 },
	{ x: "Thu", y: 3908 },
	{ x: "Fri", y: 4800 },
	{ x: "Sat", y: 3200 },
	{ x: "Sun", y: 4300 },
];

export function TrendLineCard() {
	const { t } = useTranslation();
	return (
		<StatCard
			title={t("dashboard.spendingTrend")}
			value="$3,420"
			icon={Activity}
			trend={{ value: -1.8 }}
		>
			<div className="space-y-basalt-space-lg">
				<LineChart
					data={DATA}
					series={[{ key: "y", label: t("dashboard.spendingTrend") }]}
					ariaLabel={t("dashboard.spendingTrendAria")}
					className="h-basalt-16 w-full"
					valueFormatter={formatUsd}
				/>
				<p className="text-basalt-sm text-basalt-muted-foreground">
					{t("dashboard.spendingPeriod")}
				</p>
			</div>
		</StatCard>
	);
}
