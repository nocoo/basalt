import { AreaChart } from "@nocoo/basalt/charts/area";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Mon", core: 120, growth: 80, churn: 30 },
	{ name: "Tue", core: 140, growth: 92, churn: 28 },
	{ name: "Wed", core: 150, growth: 96, churn: 26 },
	{ name: "Thu", core: 160, growth: 110, churn: 22 },
	{ name: "Fri", core: 170, growth: 120, churn: 18 },
];

export function StackedAreaCard() {
	const { t } = useTranslation();
	return (
		<Card className="rounded-card border-border bg-card shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">
					{t("dashboard.stackedActivity")}
				</CardTitle>
			</CardHeader>
			<CardContent className="h-56">
				<AreaChart
					data={data.map((row) => ({
						x: row.name,
						y: row.core,
						y2: row.growth,
						y3: row.churn,
					}))}
					ariaLabel={t("dashboard.stackedActivity")}
					className="h-full w-full"
					showAxes
				/>
			</CardContent>
		</Card>
	);
}
