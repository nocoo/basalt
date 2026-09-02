import { BarChart } from "@nocoo/basalt/charts/bar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PiggyBank } from "lucide-react";
import { useTranslation } from "react-i18next";
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

	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<PiggyBank className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.usageCategory")}
					</h3>
				</div>
				<div className="flex items-baseline gap-3">
					<h2 className="text-3xl font-semibold text-foreground font-display tracking-tight">
						$15,200
					</h2>
					<span className="text-sm text-muted-foreground">{t("dashboard.totalTransactions")}</span>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<BarChart
					data={data.map((row) => ({ x: row.name, y: row.value }))}
					series={[{ key: "y", label: t("dashboard.spend") }]}
					ariaLabel={t("dashboard.usageCategoryAria")}
					className="min-h-[200px] w-full flex-1"
					showAxes
					valueFormatter={formatUsd}
				/>
			</div>
		</LayerCard>
	);
}
