import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";
import { DonutChartWidget } from "@/components/dashboard/PieChartWidget";

const data = [
	{ label: "Active", value: 62 },
	{ label: "Idle", value: 28 },
	{ label: "Churn", value: 10 },
];

export function MiniDonutCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<h2 className="text-basalt-base text-muted-foreground">{t("dashboard.miniDonut")}</h2>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex items-center gap-basalt-space-lg">
				<div className="h-24 w-24">
					<DonutChartWidget data={data} height={96} />
				</div>
				<div className="space-y-basalt-space-lg text-basalt-sm text-muted-foreground">
					<div className="flex items-center justify-between gap-basalt-space-lg">
						<span>{t("dashboard.activeLabel")}</span>
						<span className="text-foreground">62%</span>
					</div>
					<div className="flex items-center justify-between gap-basalt-space-lg">
						<span>{t("dashboard.idleLabel")}</span>
						<span className="text-foreground">28%</span>
					</div>
					<div className="flex items-center justify-between gap-basalt-space-lg">
						<span>{t("dashboard.churnLabel")}</span>
						<span className="text-foreground">10%</span>
					</div>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
