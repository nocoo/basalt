import { Sparkline } from "@nocoo/basalt/charts/sparkline";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const sparkData = [
	{ value: 18 },
	{ value: 24 },
	{ value: 20 },
	{ value: 28 },
	{ value: 26 },
	{ value: 32 },
	{ value: 30 },
];

export function SparklineCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col ring-0 rounded-card border-border bg-card shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.weeklyActive")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-3">
				<div className="text-2xl font-semibold text-foreground">24.8k</div>
				<Sparkline
					data={sparkData.map((row, index) => ({ x: index, y: row.value }))}
					ariaLabel={t("dashboard.weeklyActive")}
					className="h-14 w-full"
				/>
				<p className="text-xs text-muted-foreground">{t("dashboard.weeklyActiveChange")}</p>
			</div>
		</LayerCard>
	);
}
