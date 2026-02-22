import { useTranslation } from "react-i18next";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, chartAxis } from "@/lib/palette";

const radarData = [
  { subject: "Speed", value: 80 },
  { subject: "Quality", value: 92 },
  { subject: "Coverage", value: 76 },
  { subject: "Reliability", value: 88 },
  { subject: "Support", value: 70 },
];

export function RadarChartCard() {
  const { t } = useTranslation();
  return (
    <Card className="rounded-card border-border bg-card shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{t("dashboard.capabilityRadar")}</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius={80}>
            <PolarGrid stroke={chartAxis} strokeOpacity={0.2} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: chartAxis, fontSize: 11 }} />
            <Radar dataKey="value" fill={CHART_COLORS[3]} fillOpacity={0.3} stroke={CHART_COLORS[3]} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
