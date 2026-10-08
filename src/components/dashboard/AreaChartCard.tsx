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
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.weeklyActivity")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<AreaChart
					data={data.map((row) => ({ x: row.day, y: row.income, y2: row.expense }))}
					series={[
						{ key: "y", label: t("dashboard.income") },
						{ key: "y2", label: t("dashboard.expense") },
					]}
					ariaLabel={t("dashboard.weeklyActivityAria")}
					className="min-h-[12.5rem] w-full flex-1"
					showAxes
					showLegend
					valueFormatter={formatUsd}
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
