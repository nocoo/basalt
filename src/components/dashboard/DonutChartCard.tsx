import { DonutChart } from "@nocoo/basalt/charts/donut";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CHART_COLORS } from "@/lib/palette";

const data = [
	{ name: "Food", value: 35 },
	{ name: "Transport", value: 20 },
	{ name: "Shopping", value: 25 },
	{ name: "Bills", value: 20 },
].map((d, i) => ({ ...d, fill: CHART_COLORS[i] }));

export function DonutChartCard() {
	const { t } = useTranslation();

	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<Target className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.expenseBreakdown")}
					</h3>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<div className="flex min-h-0 w-full flex-1 items-center justify-center">
						<DonutChart
							data={data}
							ariaLabel={t("dashboard.expenseBreakdownAria")}
							className="aspect-square h-full max-h-[180px] min-h-[100px]"
						/>
					</div>
					<div className="mt-3 grid w-full grid-cols-3 gap-x-4 gap-y-3">
						{data.map((item, i) => (
							<div key={item.name} className="flex flex-col items-center gap-0.5">
								<span className="text-sm font-medium text-foreground font-display">
									{item.value}%
								</span>
								<div className="flex items-center gap-1.5">
									<div className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
									<span className="text-xs text-muted-foreground">{item.name}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</LayerCard>
	);
}
