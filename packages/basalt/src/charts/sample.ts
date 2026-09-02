import type { BulletPoint, NamedValue, RadarPoint, SankeyData, XYPoint } from "./series";

export type { BulletPoint, NamedValue, RadarPoint, SankeyData, XYPoint } from "./series";

export const SAMPLE: XYPoint[] = [
	{ x: "Mon", y: 12, y2: 8 },
	{ x: "Tue", y: 18, y2: 11 },
	{ x: "Wed", y: 9, y2: 14 },
	{ x: "Thu", y: 22, y2: 16 },
	{ x: "Fri", y: 15, y2: 10 },
];

export const DONUT_SAMPLE: NamedValue[] = [
	{ name: "A", value: 40 },
	{ name: "B", value: 25 },
	{ name: "C", value: 35 },
];

export const RADAR_SAMPLE: RadarPoint[] = [
	{ subject: "Speed", value: 80 },
	{ subject: "Quality", value: 92 },
	{ subject: "Coverage", value: 76 },
	{ subject: "Reliability", value: 88 },
	{ subject: "Support", value: 70 },
];

export const FUNNEL_SAMPLE: NamedValue[] = [
	{ name: "Visits", value: 2400 },
	{ name: "Signup", value: 820 },
	{ name: "Activate", value: 420 },
	{ name: "Upgrade", value: 180 },
];

export const BULLET_SAMPLE: BulletPoint[] = [
	{ name: "Revenue", value: 68, target: 80 },
	{ name: "Retention", value: 72, target: 85 },
	{ name: "Adoption", value: 58, target: 70 },
];

export const SANKEY_SAMPLE: SankeyData = {
	nodes: [{ name: "Visits" }, { name: "Signup" }, { name: "Activate" }, { name: "Upgrade" }],
	links: [
		{ source: 0, target: 1, value: 1200 },
		{ source: 1, target: 2, value: 620 },
		{ source: 2, target: 3, value: 240 },
	],
};
