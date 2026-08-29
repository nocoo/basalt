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
		<LayerCard className="flex flex-col rounded-card border-border bg-card shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.bulletKpis")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 h-56">
				<BulletChart data={data} ariaLabel={t("dashboard.bulletKpis")} className="h-full w-full" />
			</div>
		</LayerCard>
	);
}
