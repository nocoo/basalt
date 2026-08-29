import { SankeyChart } from "@nocoo/basalt/charts/sankey";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useTranslation } from "react-i18next";

const data = {
	nodes: [
		{ name: "Visits" },
		{ name: "Signup" },
		{ name: "Activate" },
		{ name: "Upgrade" },
		{ name: "Churn" },
	],
	links: [
		{ source: 0, target: 1, value: 1200 },
		{ source: 1, target: 2, value: 620 },
		{ source: 2, target: 3, value: 240 },
		{ source: 2, target: 4, value: 110 },
	],
};

export function SankeyCard() {
	const { t } = useTranslation();
	return (
		<LayerCard className="flex flex-col rounded-card border-border bg-card shadow-none">
			<div className="flex flex-col space-y-2.5 p-4 pb-2">
				<h3 className="text-sm text-muted-foreground">{t("dashboard.userFlowSankey")}</h3>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 h-56">
				<SankeyChart
					data={data}
					ariaLabel={t("dashboard.userFlowSankey")}
					className="h-full w-full"
				/>
			</div>
		</LayerCard>
	);
}
