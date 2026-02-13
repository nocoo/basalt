import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapCalendar, heatmapColorScales } from "@/components/dashboard/HeatmapCalendar";

const heatmapData = Array.from({ length: 140 }).map((_, i) => {
  const date = new Date(2026, 0, 1 + i);
  return {
    date: date.toISOString().slice(0, 10),
    value: (i % 7) * 2 + 1,
  };
});

export function HeatmapCard() {
  return (
    <Card className="rounded-card border-border bg-card shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Engagement heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <HeatmapCalendar data={heatmapData} year={2026} colorScale={heatmapColorScales.blue} metricLabel="Sessions" />
      </CardContent>
    </Card>
  );
}
