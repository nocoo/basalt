import { BarChart } from "@nocoo/basalt/charts/bar";
import { LineChart } from "@nocoo/basalt/charts/line";
import { StatCard, StatGrid } from "@nocoo/basalt/charts/stat-card";
import { Activity, Wallet } from "lucide-react";

const requests = [6.2, 7.4, 6.8, 8.6, 9.1, 8.3, 10.6, 12.4].map((y, index) => ({
	x: `Period ${index + 1}`,
	y,
}));
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const revenue = [3200, 3480, 3610, 3390, 3720, 4010, 3880, 4150, 4090, 4280, 4360, 4500].map(
	(y, index) => ({ x: months[index], y }),
);
const currency = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

export default function StatCardDefault() {
	return (
		<StatGrid columns={2} className="w-full">
			<StatCard
				title="Patient visits"
				value="12.4k"
				icon={Activity}
				trend={{ value: 12, label: "vs previous period" }}
			>
				<div className="space-y-basalt-space-lg">
					<LineChart
						data={requests}
						className="h-basalt-16 w-full"
						ariaLabel="Patient visits over eight periods, from 6.2k to 12.4k"
						valueFormatter={(value) => `${value}k`}
					/>
					<p className="text-basalt-sm text-basalt-muted-foreground">Last 8 periods</p>
				</div>
			</StatCard>
			<StatCard
				title="Monthly care reimbursements"
				value="$4,500"
				icon={Wallet}
				trend={{ value: 2.4, label: "vs last month" }}
			>
				<div className="space-y-basalt-space-lg">
					<BarChart
						data={revenue}
						className="h-basalt-16 w-full"
						ariaLabel="Monthly care reimbursements, January to December, from $3,200 to $4,500"
						valueFormatter={(value) => currency.format(value)}
					/>
					<p className="text-basalt-sm text-basalt-muted-foreground">Jan-Dec / monthly</p>
				</div>
			</StatCard>
		</StatGrid>
	);
}
