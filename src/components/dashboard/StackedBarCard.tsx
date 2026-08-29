import { StackedBarChart } from "@nocoo/basalt/charts/stacked-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { useTranslation } from "react-i18next";

const stackedData = [
	{ name: "Mon", a: 120, b: 80, c: 60 },
	{ name: "Tue", a: 140, b: 90, c: 70 },
	{ name: "Wed", a: 160, b: 110, c: 80 },
	{ name: "Thu", a: 150, b: 95, c: 75 },
	{ name: "Fri", a: 170, b: 120, c: 90 },
];

export function StackedBarCard() {
	const { t } = useTranslation();
	return (
		<Card className="rounded-card border-border bg-card shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">
					{t("dashboard.stackedEngagement")}
				</CardTitle>
			</CardHeader>
			<CardContent className="h-56">
				<StackedBarChart
					data={stackedData.map((row) => ({ x: row.name, y: row.a, y2: row.b, y3: row.c }))}
					ariaLabel={t("dashboard.stackedEngagement")}
					className="h-full w-full"
				/>
			</CardContent>
		</Card>
	);
}
