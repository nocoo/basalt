import { Sparkline } from "@nocoo/basalt/charts/sparkline";
import { StatCard } from "@nocoo/basalt/charts/stat-card";
import { useTranslation } from "react-i18next";

const sparkData = [
	{ day: "Mon", value: 18 },
	{ day: "Tue", value: 24 },
	{ day: "Wed", value: 20 },
	{ day: "Thu", value: 28 },
	{ day: "Fri", value: 26 },
	{ day: "Sat", value: 32 },
	{ day: "Sun", value: 30 },
];

export function SparklineCard() {
	const { t } = useTranslation();
	return (
		<StatCard
			title={t("dashboard.weeklyActive")}
			value="24.8k"
			trendContent={
				<span className="text-basalt-muted-foreground">{t("dashboard.weeklyActiveChange")}</span>
			}
		>
			<Sparkline
				data={sparkData.map((row) => ({ x: row.day, y: row.value }))}
				ariaLabel={t("dashboard.weeklyActive")}
				className="h-basalt-16 w-full"
				dataAlternative={
					<>
						{t("dashboard.weeklyActivePeriod")}
						<span className="sr-only">{t("dashboard.weeklyActiveSummary")}</span>
					</>
				}
			/>
		</StatCard>
	);
}
