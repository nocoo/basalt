export function HeatmapCalendar() {
	const cells = Array.from({ length: 28 }, (_, i) => i);
	return (
		<div className="grid grid-cols-7 gap-1">
			{cells.map((cell) => (
				<span
					key={cell}
					className="h-3 w-3 rounded-sm bg-basalt-primary"
					style={{ opacity: 0.2 + (cell % 5) * 0.15 }}
				/>
			))}
		</div>
	);
}
