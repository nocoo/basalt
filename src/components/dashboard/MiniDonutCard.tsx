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
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.miniDonut")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex items-center gap-4">
				<div className="h-24 w-24">
					<DonutChartWidget data={data} height={96} />
				</div>
				<div className="space-y-2 text-xs text-muted-foreground">
					<div className="flex items-center justify-between gap-6">
						<span>{t("dashboard.activeLabel")}</span>
						<span className="text-foreground">62%</span>
					</div>
					<div className="flex items-center justify-between gap-6">
						<span>{t("dashboard.idleLabel")}</span>
						<span className="text-foreground">28%</span>
					</div>
					<div className="flex items-center justify-between gap-6">
						<span>{t("dashboard.churnLabel")}</span>
						<span className="text-foreground">10%</span>
					</div>
				</div>
			</div>
		</LayerCard>
	);
}
