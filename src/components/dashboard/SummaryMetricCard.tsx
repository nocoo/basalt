import { BarChart } from "@nocoo/basalt/charts/bar";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatUsd } from "@/lib/format";

const HOURS = [
	"00:00",
	"02:00",
	"04:00",
	"06:00",
	"08:00",
	"10:00",
	"12:00",
	"14:00",
	"16:00",
	"18:00",
	"20:00",
	"22:00",
];
const BALANCE = [8120, 8090, 8060, 8180, 8340, 8510, 8680, 8740, 8690, 8610, 8540, 8800];

export function SummaryMetricCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<Globe className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.totalBalance")}
					</h3>
				</div>
				<div className="flex items-baseline gap-3">
					<h2 className="text-3xl font-semibold text-foreground font-display tracking-tight">
						$8,800
					</h2>
					<span className="text-sm font-medium text-success font-display">+3.1%</span>
					<span className="text-sm text-muted-foreground">{t("common.vsLastMonth")}</span>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<BarChart
					data={HOURS.map((hour, index) => ({ x: hour, y: BALANCE[index] ?? 0 }))}
					series={[{ key: "y", label: t("dashboard.totalBalance") }]}
					ariaLabel={t("dashboard.totalBalanceAria")}
					className="min-h-[50px] w-full flex-1"
					valueFormatter={formatUsd}
				/>
			</div>
		</LayerCard>
	);
}
