import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CHART_COLORS } from "@/lib/palette";

const data = [
	{ month: "Jul", income: 4200, expense: 3100 },
	{ month: "Aug", income: 4800, expense: 3600 },
	{ month: "Sep", income: 4500, expense: 3900 },
	{ month: "Oct", income: 5100, expense: 3400 },
	{ month: "Nov", income: 4700, expense: 4100 },
	{ month: "Dec", income: 5500, expense: 3800 },
];

export function GroupedBarCard() {
	const { t } = useTranslation();
	return (
		<Card className="h-full rounded-card border-0 bg-secondary shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ArrowUpDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<CardTitle className="text-sm font-normal text-muted-foreground">
							{t("dashboard.incomeVsExpense")}
						</CardTitle>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1.5">
							<div className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[0] }} />
							<span className="text-xs text-muted-foreground">{t("dashboard.income")}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[2] }} />
							<span className="text-xs text-muted-foreground">{t("dashboard.expense")}</span>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col">
				<GroupedBarChart
					data={data.map((row) => ({ x: row.month, y: row.income, y2: row.expense }))}
					ariaLabel={t("dashboard.incomeVsExpenseAria")}
					className="min-h-[200px] w-full flex-1"
					showAxes
				/>
			</CardContent>
		</Card>
	);
}
