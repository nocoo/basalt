import { StatCard } from "@nocoo/basalt/components/stat-card";
import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LineChart } from "@/components/charts/line";
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
	const latest = formatUsd(DATA[DATA.length - 1].y);
	return (
		<StatCard
			title={t("dashboard.spendingTrend")}
			value={latest}
			icon={<Activity strokeWidth={1.5} />}
			trend={{ value: -1.8, label: t("dashboard.comparisonPeriodUnknown") }}
		>
			<div className="space-y-basalt-card-sm">
				<LineChart
					data={DATA.map((row) => ({
						...row,
						x: t(`dashboard.weekdays.${row.x.toLowerCase()}`),
					}))}
					series={[{ key: "y", label: t("dashboard.spendingTrend") }]}
					ariaLabel={t("dashboard.spendingTrendAria", { latest })}
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
