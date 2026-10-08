import { Gauge } from "@nocoo/basalt/charts/gauge";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Goal } from "lucide-react";
import { useTranslation } from "react-i18next";

const goal = 10000;
const saved = 6800;
const pct = Math.round((saved / goal) * 100);

export function RadialProgressCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Goal className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.savingsGoal")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<Gauge
						value={pct}
						valueFormatter={(next) => `${next}%`}
						ariaLabel={t("dashboard.savingsGoalAria", {
							percent: 68,
							saved: "6,800",
							target: "10,000",
						})}
						className="w-full"
					/>
					<div className="mt-basalt-space-lg grid w-full grid-cols-3 gap-x-basalt-space-lg gap-y-basalt-space-lg">
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-foreground font-display">
								${saved.toLocaleString()}
							</span>
							<span className="text-basalt-sm text-muted-foreground">{t("dashboard.saved")}</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-foreground font-display">
								${goal.toLocaleString()}
							</span>
							<span className="text-basalt-sm text-muted-foreground">{t("dashboard.target")}</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-foreground font-display">
								${(goal - saved).toLocaleString()}
							</span>
							<span className="text-basalt-sm text-muted-foreground">
								{t("dashboard.remaining")}
							</span>
						</div>
					</div>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
