import { DonutChart } from "@nocoo/basalt/charts/donut";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPercent } from "@/lib/format";
import { CHART_COLORS } from "@/lib/palette";

const data = [
	{ name: "Nutrition", value: 35 },
	{ name: "Mobility", value: 20 },
	{ name: "Medical supplies", value: 25 },
	{ name: "Lab services", value: 20 },
].map((d, i) => ({ ...d, fill: CHART_COLORS[i] }));

export function DonutChartCard() {
	const { t } = useTranslation();

	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Target className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.expenseBreakdown")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<div className="flex min-h-0 w-full flex-1 items-center justify-center">
						<DonutChart
							data={data}
							ariaLabel={t("dashboard.expenseBreakdownAria")}
							className="aspect-square h-full max-h-[11.25rem] min-h-[6.25rem]"
							valueFormatter={formatPercent}
						/>
					</div>
					<div className="mt-basalt-space-lg grid w-full grid-cols-3 gap-x-basalt-space-lg gap-y-basalt-space-lg">
						{data.map((item, i) => (
							<div key={item.name} className="flex flex-col items-center gap-basalt-space-xs">
								<span className="text-basalt-base font-medium text-foreground font-display">
									{item.value}%
								</span>
								<div className="flex items-center gap-basalt-space-md">
									<div
										className="h-2 w-2 rounded-basalt-full"
										style={{ background: CHART_COLORS[i] }}
									/>
									<span className="text-basalt-sm text-muted-foreground">{item.name}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
