import { Gauge } from "@nocoo/basalt/charts/gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
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
		<Card className="h-full rounded-card border-0 bg-secondary shadow-none">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<CardTitle className="text-sm font-normal text-muted-foreground">
						{t("dashboard.creditScore")}
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col">
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
			</CardContent>
		</Card>
	);
}
