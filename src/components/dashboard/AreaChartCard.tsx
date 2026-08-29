import { AreaChart } from "@nocoo/basalt/charts/area";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CHART_COLORS } from "@/lib/palette";

const data = [
	{ day: "Mon", income: 420, expense: 320 },
	{ day: "Tue", income: 380, expense: 450 },
	{ day: "Wed", income: 510, expense: 280 },
	{ day: "Thu", income: 620, expense: 390 },
	{ day: "Fri", income: 480, expense: 520 },
	{ day: "Sat", income: 350, expense: 180 },
	{ day: "Sun", income: 290, expense: 150 },
];

export function AreaChartCard() {
	const { t } = useTranslation();

	return (
		<Card className="h-full rounded-card border-0 bg-secondary shadow-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<CardTitle className="text-sm font-normal text-muted-foreground">
							{t("dashboard.weeklyActivity")}
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
				<AreaChart
					data={data.map((row) => ({ x: row.day, y: row.income, y2: row.expense }))}
					ariaLabel={t("dashboard.weeklyActivityAria")}
					className="min-h-[200px] w-full flex-1"
					showAxes
				/>
			</CardContent>
		</Card>
	);
}
