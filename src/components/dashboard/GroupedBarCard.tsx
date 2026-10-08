import { GroupedBarChart } from "@nocoo/basalt/charts/grouped-bar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatUsd } from "@/lib/format";

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
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<ArrowUpDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.incomeVsExpense")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<GroupedBarChart
					data={data.map((row) => ({ x: row.month, y: row.income, y2: row.expense }))}
					series={[
						{ key: "y", label: t("dashboard.income") },
						{ key: "y2", label: t("dashboard.expense") },
					]}
					ariaLabel={t("dashboard.incomeVsExpenseAria")}
					className="min-h-[12.5rem] w-full flex-1"
					showAxes
					showLegend
					valueFormatter={formatUsd}
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
