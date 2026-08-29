import { RadarChart } from "@nocoo/basalt/charts/radar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const radarData = [
	{ subject: "Speed", value: 80 },
	{ subject: "Quality", value: 92 },
	{ subject: "Coverage", value: 76 },
	{ subject: "Reliability", value: 88 },
	{ subject: "Support", value: 70 },
];

export function RadarChartCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 rounded-card border-border bg-card shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.capabilityRadar")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 h-56">
				<RadarChart
					data={radarData}
					ariaLabel={t("dashboard.capabilityRadar")}
					className="h-full w-full"
				/>
			</div>
		</LayerCard>
	);
}
