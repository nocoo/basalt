import { AreaChart } from "@nocoo/basalt/charts/area";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Mon", core: 120, growth: 80, churn: 30 },
	{ name: "Tue", core: 140, growth: 92, churn: 28 },
	{ name: "Wed", core: 150, growth: 96, churn: 26 },
	{ name: "Thu", core: 160, growth: 110, churn: 22 },
	{ name: "Fri", core: 170, growth: 120, churn: 18 },
];

export function StackedAreaCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.stackedActivity")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 h-56">
				<AreaChart
					data={data.map((row) => ({
						x: row.name,
						y: row.core,
						y2: row.growth,
						y3: row.churn,
					}))}
					series={[
						{ key: "y", label: t("dashboard.core") },
						{ key: "y2", label: t("dashboard.growth") },
						{ key: "y3", label: t("dashboard.churn") },
					]}
					ariaLabel={t("dashboard.stackedActivity")}
					className="h-full w-full"
					showAxes
					showLegend
					stacked
				/>
			</div>
		</LayerCard>
	);
}
