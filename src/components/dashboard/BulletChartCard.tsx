import { BulletChart } from "@nocoo/basalt/charts/bullet";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Revenue", value: 68, target: 80 },
	{ name: "Retention", value: 72, target: 85 },
	{ name: "Adoption", value: 58, target: 70 },
];

export function BulletChartCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<h2 className="text-basalt-base text-muted-foreground">{t("dashboard.bulletKpis")}</h2>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 h-56">
				<BulletChart data={data} ariaLabel={t("dashboard.bulletKpis")} className="h-full w-full" />
			</LayerCard.Body>
		</LayerCard>
	);
}
