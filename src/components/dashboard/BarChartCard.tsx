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
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<PiggyBank className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.usageCategory")}
					</h2>
				</div>
				<div className="flex items-baseline gap-basalt-space-lg">
					<p className="text-basalt-4xl font-semibold text-foreground font-display tracking-tight">
						$15,200
					</p>
					<span className="text-basalt-base text-muted-foreground">
						{t("dashboard.totalTransactions")}
					</span>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<BarChart
					data={data.map((row) => ({ x: row.name, y: row.value }))}
					series={[{ key: "y", label: t("dashboard.spend") }]}
					ariaLabel={t("dashboard.usageCategoryAria")}
					className="min-h-[12.5rem] w-full flex-1"
					showAxes
					valueFormatter={formatUsd}
				/>
			</LayerCard.Body>
		</LayerCard>
	);
}
