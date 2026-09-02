export type ChartSeriesDescriptor = {
	key: string;
	label?: string;
	color?: string;
};

export type XYSeriesKey = "y" | "y2" | "y3";
export type XYSeriesDescriptor = ChartSeriesDescriptor & { key: XYSeriesKey };
export type BulletSeriesKey = "value" | "target";
export type BulletSeriesDescriptor = ChartSeriesDescriptor & { key: BulletSeriesKey };

export type XYPoint = { x: string | number; y: number; y2?: number; y3?: number };
export type NamedValue = { name: string; value: number };
export type RadarPoint = { subject: string; value: number };
export type BulletPoint = { name: string; value: number; target: number };
export type SankeyData = {
	nodes: { name: string }[];
	links: { source: number; target: number; value: number }[];
};

export function resolveChartSeries(
	series: ChartSeriesDescriptor[] | undefined,
	fallbackKeys: string[],
): ChartSeriesDescriptor[] {
	if (series && series.length > 0) {
		return series;
	}
	return fallbackKeys.map((key) => ({ key }));
}

export function xyFallbackKeys(data: Array<{ y2?: number; y3?: number }>): string[] {
	const keys = ["y"];
	if (data.some((point) => point.y2 != null)) {
		keys.push("y2");
	}
	if (data.some((point) => point.y3 != null)) {
		keys.push("y3");
	}
	return keys;
}
