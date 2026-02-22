import { useTranslation } from "react-i18next";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { chart } from "@/lib/palette";

const score = 742;
const max = 850;
const pct = Math.round((score / max) * 100);

const data = [{ value: pct }];

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
          <CardTitle className="text-sm font-normal text-muted-foreground">{t("dashboard.creditScore")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="flex flex-1 flex-col items-center min-h-0">
          <div className="flex-1 min-h-0 w-full flex items-center justify-center" role="img" aria-label={t("dashboard.creditScoreAria", { score, max, rating: label })}>
            <div className="relative aspect-square h-full max-h-[220px] min-h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="75%"
                  outerRadius="95%"
                  startAngle={90}
                  endAngle={-270}
                  data={data}
                  barSize={12}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    dataKey="value"
                    cornerRadius={6}
                    fill={chart.green}
                    background={{ fill: chart.gray }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold text-foreground font-display tracking-tight">{score}</span>
                <span className={`text-[10px] font-medium ${color}`}>{label}</span>
              </div>
            </div>
          </div>
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
