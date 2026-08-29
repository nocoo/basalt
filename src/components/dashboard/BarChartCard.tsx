import { BarChart } from "@nocoo/basalt/charts/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { PiggyBank } from "lucide-react";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Jan", value: 12000 },
	{ name: "Feb", value: 15000 },
	{ name: "Mar", value: 11000 },
	{ name: "Apr", value: 18000 },
	{ name: "May", value: 14000 },
	{ name: "Jun", value: 20000 },
	{ name: "Jul", value: 16000 },
	{ name: "Aug", value: 22000 },
	{ name: "Sep", value: 13000 },
	{ name: "Oct", value: 17000 },
	{ name: "Nov", value: 25000 },
	{ name: "Dec", value: 19000 },
];

export function BarChartCard() {
	const { t } = useTranslation();

	return (
		<Card className="h-full rounded-card border-0 bg-secondary shadow-none">
			<CardHeader>
				<div className="flex items-center gap-2">
					<PiggyBank className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<CardTitle className="text-sm font-normal text-muted-foreground">
						{t("dashboard.usageCategory")}
					</CardTitle>
				</div>
				<div className="flex items-baseline gap-3">
					<h2 className="text-3xl font-semibold text-foreground font-display tracking-tight">
						$15,200
					</h2>
					<span className="text-sm text-muted-foreground">{t("dashboard.totalTransactions")}</span>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col">
				<BarChart
					data={data.map((row) => ({ x: row.name, y: row.value }))}
					ariaLabel={t("dashboard.usageCategoryAria")}
					className="min-h-[200px] w-full flex-1"
					showAxes
				/>
			</CardContent>
		</Card>
	);
}
