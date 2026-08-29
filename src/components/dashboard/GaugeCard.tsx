import { Gauge } from "@nocoo/basalt/charts/gauge";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const score = 742;
const max = 850;
const pct = Math.round((score / max) * 100);

export function GaugeCard() {
	const { t } = useTranslation();

	function getScoreLabel(s: number) {
		if (s >= 740) return { label: t("dashboard.excellent"), color: "text-success" };
		if (s >= 670) return { label: t("dashboard.good"), color: "text-foreground" };
		if (s >= 580) return { label: t("dashboard.fair"), color: "text-amber-500" };
		return { label: t("dashboard.poor"), color: "text-destructive" };
	}

	const { label, color } = getScoreLabel(score);

	return (
		<LayerCard className="flex flex-col ring-0 h-full rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("dashboard.creditScore")}
					</h3>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<Gauge
						value={pct}
						ariaLabel={t("dashboard.creditScoreAria", { score, max, rating: label })}
						className="w-full"
					/>
					<div className="mt-3 grid w-full grid-cols-3 gap-x-4 gap-y-3">
						<div className="flex flex-col items-center gap-0.5">
							<span className="text-sm font-medium text-foreground font-display">{score}</span>
							<span className="text-xs text-muted-foreground">{t("dashboard.score")}</span>
						</div>
						<div className="flex flex-col items-center gap-0.5">
							<span className="text-sm font-medium text-foreground font-display">{max}</span>
							<span className="text-xs text-muted-foreground">{t("dashboard.max")}</span>
						</div>
						<div className="flex flex-col items-center gap-0.5">
							<span className={`text-sm font-medium font-display ${color}`}>{label}</span>
							<span className="text-xs text-muted-foreground">{t("dashboard.rating")}</span>
						</div>
					</div>
				</div>
			</div>
		</LayerCard>
	);
}
