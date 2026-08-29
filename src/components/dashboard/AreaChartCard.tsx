import { AreaChart } from "@nocoo/basalt/charts/area";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
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
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("dashboard.weeklyActivity")}
						</h3>
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
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<AreaChart
					data={data.map((row) => ({ x: row.day, y: row.income, y2: row.expense }))}
					ariaLabel={t("dashboard.weeklyActivityAria")}
					className="min-h-[200px] w-full flex-1"
					showAxes
				/>
			</div>
		</LayerCard>
	);
}
