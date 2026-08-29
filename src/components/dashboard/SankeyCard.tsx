import { SankeyChart } from "@nocoo/basalt/charts/sankey";
import { Card, CardContent, CardHeader, CardTitle } from "@nocoo/basalt/components/card";
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
		<Card className="rounded-card border-border bg-card shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm text-muted-foreground">
					{t("dashboard.userFlowSankey")}
				</CardTitle>
			</CardHeader>
			<CardContent className="h-56">
				<SankeyChart
					data={data}
					ariaLabel={t("dashboard.userFlowSankey")}
					className="h-full w-full"
				/>
			</CardContent>
		</Card>
	);
}
