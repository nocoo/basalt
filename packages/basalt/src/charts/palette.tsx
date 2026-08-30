const v = (token: string) => `hsl(var(--basalt-${token}))`;

export const withAlpha = (token: string, alpha: number) => `hsl(var(--basalt-${token}) / ${alpha})`;

export const chartAxis = v("chart-axis");
export const chartMuted = v("chart-muted");

export const chart = {
	primary: v("chart-1"),
	sky: v("chart-2"),
	teal: v("chart-3"),
	jade: v("chart-4"),
	green: v("chart-5"),
	lime: v("chart-6"),
	amber: v("chart-7"),
	orange: v("chart-8"),
	vermilion: v("chart-9"),
	red: v("chart-10"),
	rose: v("chart-11"),
	magenta: v("chart-12"),
	orchid: v("chart-13"),
	purple: v("chart-14"),
	indigo: v("chart-15"),
	cobalt: v("chart-16"),
	steel: v("chart-17"),
	cadet: v("chart-18"),
	seafoam: v("chart-19"),
	olive: v("chart-20"),
	gold: v("chart-21"),
	tangerine: v("chart-22"),
	crimson: v("chart-23"),
	gray: v("chart-24"),
} as const;

export const CHART_COLORS = Object.values(chart);

export function ChartPalette({ ariaLabel = "Chart colors" }: { ariaLabel?: string }) {
	return (
		<div className="flex flex-wrap gap-2" role="img" aria-label={ariaLabel}>
			{CHART_COLORS.map((color) => (
				<span key={color} className="h-8 w-8 rounded-basalt-sm" style={{ background: color }} />
			))}
		</div>
	);
}
