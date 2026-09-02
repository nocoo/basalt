import { HeatmapCalendar, heatmapColorScales } from "@nocoo/basalt/charts/heatmap-calendar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const heatmapData = Array.from({ length: 365 }).map((_, i) => {
	const date = new Date(2026, 0, 1 + i);
	const noise = Math.sin(i * 12.9898) * 43758.5453;
	const random = noise - Math.floor(noise);
	const value = Math.max(1, Math.round(3 + random * 9));
	return {
		date: date.toISOString().slice(0, 10),
		value,
	};
});

export function HeatmapCard() {
	const { t, i18n } = useTranslation();
	return (
		<LayerCard className="flex h-full flex-col rounded-card border-0 bg-secondary shadow-none ring-0">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.engagementHeatmap")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4">
				<HeatmapCalendar
					data={heatmapData}
					year={2026}
					colorScale={heatmapColorScales.blue}
					metricLabel={t("dashboard.sessions")}
					locale={i18n.language}
					lessLabel={t("common.less")}
					moreLabel={t("common.more")}
				/>
			</div>
		</LayerCard>
	);
}
