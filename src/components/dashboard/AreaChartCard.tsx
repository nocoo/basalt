import { AreaChart } from "@nocoo/basalt/charts/area";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatUsd } from "@/lib/format";

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
				<div className="flex items-center gap-2">
					<BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.weeklyActivity")}
					</h3>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<AreaChart
					data={data.map((row) => ({ x: row.day, y: row.income, y2: row.expense }))}
					series={[
						{ key: "y", label: t("dashboard.income") },
						{ key: "y2", label: t("dashboard.expense") },
					]}
					ariaLabel={t("dashboard.weeklyActivityAria")}
					className="min-h-[200px] w-full flex-1"
					showAxes
					showLegend
					valueFormatter={formatUsd}
				/>
			</div>
		</LayerCard>
	);
}
