export function StatCard({
	label = "Requests",
	value = "12.4k",
	ariaLabel,
	className,
}: {
	label?: string;
	value?: string;
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<div
			className={
				className ?? "rounded-basalt-md border border-basalt-border bg-basalt-secondary p-4"
			}
			role="img"
			aria-label={ariaLabel ?? `${label} ${value}`}
		>
			<p className="text-xs text-basalt-muted-foreground">{label}</p>
			<p className="text-2xl font-semibold text-basalt-foreground">{value}</p>
		</div>
	);
}
