import { BulletChart } from "@nocoo/basalt/charts/bullet";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Revenue", value: 68, target: 80 },
	{ name: "Retention", value: 72, target: 85 },
	{ name: "Adoption", value: 58, target: 70 },
];

export function BulletChartCard() {
	const { t } = useTranslation();
	return (
		<Card className="rounded-card border-border bg-card shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">{t("dashboard.bulletKpis")}</CardTitle>
			</CardHeader>
			<CardContent className="h-56">
				<BulletChart data={data} ariaLabel={t("dashboard.bulletKpis")} className="h-full w-full" />
			</CardContent>
		</Card>
	);
}
