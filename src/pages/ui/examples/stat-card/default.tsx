import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { Activity, Wallet } from "@nocoo/basalt/icons";

function LineChart({
	data,
	className,
	ariaLabel,
	valueFormatter,
}: {
	data: { x: string; y: number }[];
	className?: string;
	ariaLabel: string;
	valueFormatter: (value: number) => string;
}) {
	const max = Math.max(...data.map((point) => point.y));
	const points = data
		.map(
			(point, index) =>
				`${(index / Math.max(data.length - 1, 1)) * 100},${32 - (point.y / max) * 28}`,
		)
		.join(" ");
	return (
		<svg viewBox="0 0 100 36" className={className} role="img" aria-label={ariaLabel}>
			<title>{data.map((point) => valueFormatter(point.y)).join(", ")}</title>
			<polyline points={points} fill="none" stroke="hsl(var(--basalt-chart-1))" strokeWidth="3" />
		</svg>
	);
}

function BarChart({
	data,
	className,
	ariaLabel,
	valueFormatter,
}: {
	data: { x: string; y: number }[];
	className?: string;
	ariaLabel: string;
	valueFormatter: (value: number) => string;
}) {
	const max = Math.max(...data.map((point) => point.y));
	return (
		<div
			className={`flex items-end gap-basalt-space-sm ${className ?? ""}`}
			role="img"
			aria-label={`${ariaLabel}. Values: ${data.map((point) => valueFormatter(point.y)).join(", ")}`}
		>
			{data.map((point) => (
				<span
					key={point.x}
					className="min-w-0 flex-1 bg-basalt-chart-2"
					style={{ height: `${(point.y / max) * 100}%` }}
				/>
			))}
		</div>
	);
}

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
				icon={<Activity strokeWidth={1.5} />}
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
				icon={<Wallet strokeWidth={1.5} />}
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
