import { FunnelChart } from "@nocoo/basalt/charts/funnel";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
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
		<Card className="rounded-card border-border bg-card shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">
					{t("dashboard.funnelConversion")}
				</CardTitle>
			</CardHeader>
			<CardContent className="h-56">
				<FunnelChart
					data={data}
					ariaLabel={t("dashboard.funnelConversion")}
					className="h-full w-full"
				/>
			</CardContent>
		</Card>
	);
}
