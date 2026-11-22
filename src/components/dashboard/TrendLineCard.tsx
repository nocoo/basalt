import { StatCard } from "@nocoo/basalt/components/stat-card";
import { Activity } from "lucide-react";
import { LineChart } from "@/components/charts/line";
import { formatUsd } from "@/lib/format";

const DATA = [
	{ x: "Mon", y: 2400 },
	{ x: "Tue", y: 1398 },
	{ x: "Wed", y: 5800 },
	{ x: "Thu", y: 3908 },
	{ x: "Fri", y: 4800 },
	{ x: "Sat", y: 3200 },
	{ x: "Sun", y: 4300 },
];

export function TrendLineCard() {
	const latest = formatUsd(DATA[DATA.length - 1].y);
	return (
		<StatCard
			title="Care spending trend"
			value={latest}
			icon={<Activity />}
			trend={{ value: -1.8, label: "period not specified" }}
		>
			<div className="space-y-basalt-card-sm">
				<LineChart
					data={DATA}
					series={[{ key: "y", label: "Care spending trend" }]}
					ariaLabel={`Care spending from Monday to Sunday; latest daily spending ${latest}`}
					className="h-basalt-16 w-full"
					valueFormatter={formatUsd}
				/>
				<p className="text-basalt-sm text-basalt-muted-foreground">Mon–Sun · daily care spending</p>
			</div>
		</StatCard>
	);
}
