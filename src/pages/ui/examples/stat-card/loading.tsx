import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";

export default function StatCardLoadingExample() {
	return (
		<StatGrid columns={2}>
			<StatCard title="Care plans" value={24} loading />
			<StatCard title="Active alerts" value={3} />
		</StatGrid>
	);
}
