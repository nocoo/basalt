import { StatCard } from "@nocoo/basalt/components/stat-card";
import { Globe } from "lucide-react";
import { LineChart } from "@/components/charts/line";
import { formatUsd } from "@/lib/format";

const HOURS = [
	"00:00",
	"02:00",
	"04:00",
	"06:00",
	"08:00",
	"10:00",
	"12:00",
	"14:00",
	"16:00",
	"18:00",
	"20:00",
	"22:00",
];
const BALANCE = [8120, 8090, 8060, 8180, 8340, 8510, 8680, 8740, 8690, 8610, 8540, 8800];
const DATA = HOURS.map((x, index) => ({ x, y: BALANCE[index] }));

export function SummaryMetricCard() {
	return (
		<StatCard
			title="Available care funds"
			value="$8,800"
			icon={<Globe />}
			trend={{ value: 3.1, label: "vs last month" }}
		>
			<div className="space-y-basalt-card-sm">
				<LineChart
					data={DATA}
					series={[{ key: "y", label: "Available care funds" }]}
					ariaLabel="Available care funds across 12 intervals, $8,120 to $8,800; line chart, vertical scale $8,000 to $9,000"
					className="h-basalt-16 w-full"
					valueFormatter={formatUsd}
					yDomain={[8000, 9000]}
				/>
				<p className="text-basalt-sm text-basalt-muted-foreground">
					Today, every 2 hours · $8k–$9k care-fund scale
				</p>
			</div>
		</StatCard>
	);
}
