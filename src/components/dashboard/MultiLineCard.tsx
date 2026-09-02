import { LineChart } from "@nocoo/basalt/charts/line";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";
import { formatPercent } from "@/lib/format";

const data = [
	{ name: "Week 1", retention: 78, activation: 62, conversion: 34 },
	{ name: "Week 2", retention: 82, activation: 66, conversion: 36 },
	{ name: "Week 3", retention: 84, activation: 70, conversion: 38 },
	{ name: "Week 4", retention: 88, activation: 74, conversion: 40 },
];

export function MultiLineCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.multiSeriesTrend")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 h-56">
				<LineChart
					data={data.map((row) => ({
						x: row.name,
						y: row.retention,
						y2: row.activation,
						y3: row.conversion,
					}))}
					series={[
						{ key: "y", label: t("dashboard.retention") },
						{ key: "y2", label: t("dashboard.activation") },
						{ key: "y3", label: t("dashboard.conversion") },
					]}
					ariaLabel={t("dashboard.multiSeriesTrend")}
					className="h-full w-full"
					showAxes
					showLegend
					valueFormatter={formatPercent}
				/>
			</div>
		</LayerCard>
	);
}
