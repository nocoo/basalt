import { LineChart } from "@nocoo/basalt/charts/line";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

const data = [
	{ name: "Mon", value: 2400 },
	{ name: "Tue", value: 1398 },
	{ name: "Wed", value: 5800 },
	{ name: "Thu", value: 3908 },
	{ name: "Fri", value: 4800 },
	{ name: "Sat", value: 3200 },
	{ name: "Sun", value: 4300 },
];

export function TrendLineCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.spendingTrend")}
					</h3>
				</div>
				<div className="flex items-baseline gap-3">
					<h2 className="text-3xl font-semibold text-foreground font-display tracking-tight">
						$3,420
					</h2>
					<span className="text-xs font-medium text-destructive">-1.8%</span>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<LineChart
					data={data.map((row) => ({ x: row.name, y: row.value }))}
					ariaLabel={t("dashboard.spendingTrendAria")}
					className="min-h-[100px] w-full flex-1"
					showAxes
				/>
			</div>
		</LayerCard>
	);
}
