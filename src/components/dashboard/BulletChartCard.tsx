import { BulletChart } from "@nocoo/basalt/charts/bullet";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Care adherence", value: 68, target: 80 },
	{ name: "Follow-up completion", value: 72, target: 85 },
	{ name: "Plan participation", value: 58, target: 70 },
];

export function BulletChartCard() {
	const { t } = useTranslation();
	const targetLabel = t("dashboard.target");
	const summary = data
		.map((point) => `${point.name}: ${point.value}%, ${targetLabel} ${point.target}%`)
		.join(" · ");

	return (
		<LayerCard>
			<LayerCard.Header className="flex-col">
				<h2 className="text-basalt-base text-muted-foreground">{t("dashboard.bulletKpis")}</h2>
			</LayerCard.Header>
			<LayerCard.Body
				className="overflow-x-auto basalt-focus-inset"
				role="region"
				aria-label={t("dashboard.bulletKpis")}
				tabIndex={0}
			>
				<BulletChart
					data={data}
					ariaLabel={t("dashboard.bulletKpis")}
					className="h-56 min-w-72 w-full"
					summary={summary}
					valueFormatter={(value) => `${value}%`}
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
