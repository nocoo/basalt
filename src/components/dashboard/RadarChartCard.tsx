import { RadarChart } from "@nocoo/basalt/charts/radar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const radarData = [
	{ subject: "dashboard.radarSpeed", value: 80 },
	{ subject: "dashboard.radarQuality", value: 92 },
	{ subject: "dashboard.radarCoverage", value: 76 },
	{ subject: "dashboard.radarReliability", value: 88 },
	{ subject: "dashboard.radarSupport", value: 70 },
];

export function RadarChartCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<h2 className="text-basalt-base text-muted-foreground">{t("dashboard.capabilityRadar")}</h2>
			</LayerCard.Header>
			<LayerCard.Body className="h-64 min-w-0 shrink-0">
				<RadarChart
					data={radarData.map((item) => ({ ...item, subject: t(item.subject) }))}
					ariaLabel={t("dashboard.capabilityRadar")}
					className="h-full w-full"
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
