import { BarChart } from "@nocoo/basalt/charts/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const data = Array.from({ length: 24 }, () => ({
	value: 3000 + Math.random() * 5000,
}));

export function SummaryMetricCard() {
	const { t } = useTranslation();
	return (
		<Card className="h-full rounded-card border-0 bg-secondary shadow-none">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Globe className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<CardTitle className="text-sm font-normal text-muted-foreground">
						{t("dashboard.totalBalance")}
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col">
				<div className="flex flex-col flex-1 rounded-widget border border-border p-4">
					<h2 className="text-3xl font-semibold text-foreground font-display tracking-tight">
						$8,800
					</h2>
					<div className="mt-1 flex items-center gap-2">
						<span className="text-sm font-medium text-success font-display">+3.1%</span>
						<span className="text-sm text-muted-foreground">{t("common.vsLastMonth")}</span>
					</div>
					<BarChart
						data={data.map((row, index) => ({ x: index, y: row.value }))}
						ariaLabel={t("dashboard.totalBalanceAria")}
						className="mt-3 min-h-[50px] w-full flex-1"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
