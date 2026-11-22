import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PiggyBank } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BarChart } from "@/components/charts/bar";
import { formatUsd } from "@/lib/format";

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
	const total = formatUsd(data.reduce((sum, row) => sum + row.value, 0));

	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<PiggyBank className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						{t("dashboard.usageCategory")}
					</h2>
				</div>
				<div className="flex items-baseline gap-basalt-space-lg">
					<p className="text-basalt-3xl font-semibold text-basalt-foreground font-basalt-display tabular-nums tracking-tight">
						{total}
					</p>
					<span className="text-basalt-lg font-semibold text-basalt-foreground">
						{t("dashboard.totalTransactions")}
					</span>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<BarChart
					data={data.map((row) => ({
						x: t(`dashboard.months.${row.name.toLowerCase()}`),
						y: row.value,
					}))}
					series={[{ key: "y", label: t("dashboard.spend") }]}
					ariaLabel={t("dashboard.usageCategoryAria", { total })}
					className="min-h-[12.5rem] w-full flex-1"
					showAxes
					valueFormatter={formatUsd}
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
