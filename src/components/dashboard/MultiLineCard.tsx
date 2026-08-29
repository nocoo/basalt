import { LineChart } from "@nocoo/basalt/charts/line";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Week 1", retention: 78, activation: 62, conversion: 34 },
	{ name: "Week 2", retention: 82, activation: 66, conversion: 36 },
	{ name: "Week 3", retention: 84, activation: 70, conversion: 38 },
	{ name: "Week 4", retention: 88, activation: 74, conversion: 40 },
];

export function MultiLineCard() {
	const { t } = useTranslation();
	return (
		<Card className="rounded-card border-border bg-card shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">
					{t("dashboard.multiSeriesTrend")}
				</CardTitle>
			</CardHeader>
			<CardContent className="h-56">
				<LineChart
					data={data.map((row) => ({ x: row.name, y: row.retention, y2: row.activation }))}
					ariaLabel={t("dashboard.multiSeriesTrend")}
					className="h-full w-full"
					showAxes
				/>
			</CardContent>
		</Card>
	);
}
