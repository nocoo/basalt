import { Gauge } from "@nocoo/basalt/charts/gauge";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const score = 742;
const max = 850;

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
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.creditScore")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex flex-1 flex-col items-center min-h-0">
					<Gauge
						value={score}
						max={max}
						ariaLabel={t("dashboard.creditScoreAria", { score, max, rating: label })}
						className="w-full"
					/>
					<div className="mt-basalt-space-lg grid w-full grid-cols-3 gap-x-basalt-space-lg gap-y-basalt-space-lg">
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-foreground font-display">
								{score}
							</span>
							<span className="text-basalt-sm text-muted-foreground">{t("dashboard.score")}</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-foreground font-display">
								{max}
							</span>
							<span className="text-basalt-sm text-muted-foreground">{t("dashboard.max")}</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className={`text-basalt-base font-medium font-display ${color}`}>{label}</span>
							<span className="text-basalt-sm text-muted-foreground">{t("dashboard.rating")}</span>
						</div>
					</div>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
