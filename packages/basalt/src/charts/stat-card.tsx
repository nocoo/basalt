export function StatCard({
	label = "Requests",
	value = "12.4k",
}: {
	label?: string;
	value?: string;
}) {
	return (
		<div className="rounded-basalt-md border border-basalt-border bg-basalt-secondary p-4">
			<p className="text-xs text-basalt-muted-foreground">{label}</p>
			<p className="text-2xl font-semibold text-basalt-foreground">{value}</p>
		</div>
	);
}
