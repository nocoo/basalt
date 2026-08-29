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
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<Goal className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.savingsGoal")}
					</h3>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<Gauge
						value={pct}
						ariaLabel={t("dashboard.savingsGoalAria", {
							percent: 68,
							saved: "6,800",
							target: "10,000",
						})}
						className="w-full"
					/>
					<div className="mt-3 grid w-full grid-cols-3 gap-x-4 gap-y-3">
						<div className="flex flex-col items-center gap-0.5">
							<span className="text-sm font-medium text-foreground font-display">
								${saved.toLocaleString()}
							</span>
							<span className="text-xs text-muted-foreground">{t("dashboard.saved")}</span>
						</div>
						<div className="flex flex-col items-center gap-0.5">
							<span className="text-sm font-medium text-foreground font-display">
								${goal.toLocaleString()}
							</span>
							<span className="text-xs text-muted-foreground">{t("dashboard.target")}</span>
						</div>
						<div className="flex flex-col items-center gap-0.5">
							<span className="text-sm font-medium text-foreground font-display">
								${(goal - saved).toLocaleString()}
							</span>
							<span className="text-xs text-muted-foreground">{t("dashboard.remaining")}</span>
						</div>
					</div>
				</div>
			</div>
		</LayerCard>
	);
}
