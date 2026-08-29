import { FunnelChart } from "@nocoo/basalt/charts/funnel";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Visits", value: 2400 },
	{ name: "Signup", value: 820 },
	{ name: "Activate", value: 420 },
	{ name: "Upgrade", value: 180 },
];

export function FunnelChartCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 rounded-card border-border bg-card shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.funnelConversion")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 h-56">
				<FunnelChart
					data={data}
					ariaLabel={t("dashboard.funnelConversion")}
					className="h-full w-full"
				/>
			</div>
		</LayerCard>
	);
}
