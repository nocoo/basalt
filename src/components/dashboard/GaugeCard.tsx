import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Gauge } from "@/components/charts/gauge";

const score = 742;
const max = 850;

export function GaugeCard() {
	const { t } = useTranslation();

	function getScoreLabel(s: number) {
		if (s >= 740) return { label: t("dashboard.excellent"), color: "text-basalt-success" };
		if (s >= 670) return { label: t("dashboard.good"), color: "text-basalt-foreground" };
		if (s >= 580) return { label: t("dashboard.fair"), color: "text-basalt-warning" };
		return { label: t("dashboard.poor"), color: "text-basalt-danger-solid" };
	}

	const { label, color } = getScoreLabel(score);

	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Shield className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
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
					<div className="mt-basalt-card-sm grid w-full grid-cols-3 gap-basalt-card-sm">
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display tabular-nums">
								{score}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">
								{t("dashboard.score")}
							</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span className="text-basalt-base font-medium text-basalt-foreground font-basalt-display tabular-nums">
								{max}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">
								{t("dashboard.max")}
							</span>
						</div>
						<div className="flex flex-col items-center gap-basalt-space-xs">
							<span
								className={`text-basalt-base font-medium font-basalt-display tabular-nums ${color}`}
							>
								{label}
							</span>
							<span className="text-basalt-sm text-basalt-muted-foreground">
								{t("dashboard.rating")}
							</span>
						</div>
					</div>
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
