import { StatCard } from "@nocoo/basalt/components/stat-card";
import { TrendingUp } from "lucide-react";
import { BarChart } from "@/components/charts/bar";
import { formatUsd } from "@/lib/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INCOME = [3200, 3480, 3610, 3390, 3720, 4010, 3880, 4150, 4090, 4280, 4360, 4500];
const DATA = MONTHS.map((x, index) => ({ x, y: INCOME[index] }));

export function SecondaryMetricCard() {
	const current = INCOME[INCOME.length - 1];
	const previous = INCOME[INCOME.length - 2];
	const change = Math.round(((current - previous) / previous) * 1000) / 10;
	return (
		<StatCard
			title="Care reimbursements"
			value={formatUsd(current)}
			icon={<TrendingUp />}
			trend={{ value: change, label: "vs last month" }}
		>
			<div className="space-y-basalt-card-sm">
				<BarChart
					data={DATA}
					series={[{ key: "y", label: "Care reimbursements" }]}
					ariaLabel="Monthly care reimbursements from January to December, $3,200 to $4,500; bar chart"
					className="h-basalt-16 w-full"
					valueFormatter={formatUsd}
				/>
				<p className="text-basalt-sm text-basalt-muted-foreground">
					Jan–Dec · monthly reimbursements
				</p>
			</div>
		</StatCard>
	);
}
