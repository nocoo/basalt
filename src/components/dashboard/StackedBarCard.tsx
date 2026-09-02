import { StackedBarChart } from "@nocoo/basalt/charts/stacked-bar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const stackedData = [
	{ name: "Mon", a: 120, b: 80, c: 60 },
	{ name: "Tue", a: 140, b: 90, c: 70 },
	{ name: "Wed", a: 160, b: 110, c: 80 },
	{ name: "Thu", a: 150, b: 95, c: 75 },
	{ name: "Fri", a: 170, b: 120, c: 90 },
];

export function StackedBarCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.stackedEngagement")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 h-56">
				<StackedBarChart
					data={stackedData.map((row) => ({ x: row.name, y: row.a, y2: row.b, y3: row.c }))}
					series={[
						{ key: "y", label: "Core" },
						{ key: "y2", label: "Growth" },
						{ key: "y3", label: "Churn" },
					]}
					ariaLabel={t("dashboard.stackedEngagement")}
					className="h-full w-full"
					showAxes
					showLegend
				/>
			</div>
		</LayerCard>
	);
}
