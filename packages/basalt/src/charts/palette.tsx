const SWATCHES = ["#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed"];

export function ChartPalette() {
	return (
		<div className="flex gap-2">
			{SWATCHES.map((color) => (
				<span key={color} className="h-8 w-8 rounded-basalt-sm" style={{ background: color }} />
			))}
		</div>
	);
}
