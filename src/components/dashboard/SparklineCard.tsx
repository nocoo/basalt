import { Sparkline } from "@nocoo/basalt/charts/sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { useTranslation } from "react-i18next";

const sparkData = [
	{ value: 18 },
	{ value: 24 },
	{ value: 20 },
	{ value: 28 },
	{ value: 26 },
	{ value: 32 },
	{ value: 30 },
];

export function SparklineCard() {
	const { t } = useTranslation();
	return (
		<Card className="rounded-card border-border bg-card shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">
					{t("dashboard.weeklyActive")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="text-2xl font-semibold text-foreground">24.8k</div>
				<Sparkline
					data={sparkData.map((row, index) => ({ x: index, y: row.value }))}
					ariaLabel={t("dashboard.weeklyActive")}
					className="h-14 w-full"
				/>
				<p className="text-xs text-muted-foreground">{t("dashboard.weeklyActiveChange")}</p>
			</CardContent>
		</Card>
	);
}
