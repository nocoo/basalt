import { RadarChart } from "@nocoo/basalt/charts/radar";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { useTranslation } from "react-i18next";

const radarData = [
	{ subject: "Speed", value: 80 },
	{ subject: "Quality", value: 92 },
	{ subject: "Coverage", value: 76 },
	{ subject: "Reliability", value: 88 },
	{ subject: "Support", value: 70 },
];

export function RadarChartCard() {
	const { t } = useTranslation();
	return (
		<Card className="rounded-card border-border bg-card shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">
					{t("dashboard.capabilityRadar")}
				</CardTitle>
			</CardHeader>
			<CardContent className="h-56">
				<RadarChart
					data={radarData}
					ariaLabel={t("dashboard.capabilityRadar")}
					className="h-full w-full"
				/>
			</CardContent>
		</Card>
	);
}
