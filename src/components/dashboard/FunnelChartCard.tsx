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
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<h2 className="text-basalt-base text-muted-foreground">
					{t("dashboard.funnelConversion")}
				</h2>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 h-56">
				<FunnelChart
					data={data}
					ariaLabel={t("dashboard.funnelConversion")}
					className="h-full w-full"
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
