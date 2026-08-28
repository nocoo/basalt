export function HeatmapCalendar({
	values = Array.from({ length: 28 }, (_, index) => index % 5),
	ariaLabel = "Heatmap calendar",
	className,
}: {
	values?: number[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<div className={className ?? "grid grid-cols-7 gap-1"} role="img" aria-label={ariaLabel}>
			{values.map((value, index) => (
				<span
					key={index}
					className="h-3 w-3 rounded-sm bg-basalt-primary"
					style={{ opacity: 0.2 + (value % 5) * 0.15 }}
				/>
			))}
		</div>
	);
}
