import { CHART_COLORS, chartAxis, withAlpha } from "./palette";
import type { ChartSeriesDescriptor } from "./series";

export type { ChartSeriesDescriptor } from "./series";

export type ChartTypeFace = "axis" | "legend" | "tooltipTitle" | "tooltipBody";

export const CHART_TYPE = {
	axisFontSize: 11,
	legendFontSize: 12,
	tooltipTitleSize: 12,
	tooltipBodySize: 12,
	tooltipDot: 8,
	strokeWidth: 2,
	gridDash: "3 3",
	gridOpacity: 0.15,
	areaFillAlpha: 0.2,
} as const;

export function chartFontSize(face: ChartTypeFace): number {
	if (face === "legend") {
		return CHART_TYPE.legendFontSize;
	}
	if (face === "tooltipTitle") {
		return CHART_TYPE.tooltipTitleSize;
	}
	if (face === "tooltipBody") {
		return CHART_TYPE.tooltipBodySize;
	}
	return CHART_TYPE.axisFontSize;
}

export function chartTextStyle(face: ChartTypeFace): { fontSize: number } {
	return { fontSize: chartFontSize(face) };
}

export function chartTickStyle(face: ChartTypeFace = "axis"): {
	fontSize: number;
	fill: string;
} {
	return { fontSize: chartFontSize(face), fill: chartAxis };
}

export function getChartColor(index: number): string {
	return CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0];
}

export const AXIS_CONFIG = {
	get tick() {
		return chartTickStyle("axis");
	},
	axisLine: false as const,
	tickLine: false as const,
};

export function cartesianAxisProps(hidden = false) {
	return { hide: hidden, ...AXIS_CONFIG };
}

export const GRID_PROPS = {
	vertical: false as const,
	stroke: chartAxis,
	strokeOpacity: CHART_TYPE.gridOpacity,
	strokeDasharray: CHART_TYPE.gridDash,
};

export const BAR_RADIUS = {
	horizontal: [0, 4, 4, 0] as [number, number, number, number],
	vertical: [4, 4, 0, 0] as [number, number, number, number],
};

export const ANIMATION_PROPS = {
	isAnimationActive: false,
};

export const CHART_TOOLTIP_CURSOR_LINE = {
	stroke: chartAxis,
	strokeOpacity: 0.35,
	strokeWidth: 1,
} as const;

export const CHART_TOOLTIP_CURSOR_BAR = {
	fill: withAlpha("foreground", 0.06),
	stroke: "none",
} as const;

export function chartTooltipContentStyle(): {
	background: string;
	border: string;
	borderRadius: string;
	boxShadow: string;
	fontSize: number;
	color: string;
	padding: string;
} {
	return {
		background: "hsl(var(--basalt-popover))",
		border: "1px solid hsl(var(--basalt-border) / 0.6)",
		borderRadius: "10px",
		boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
		fontSize: chartFontSize("tooltipBody"),
		color: "hsl(var(--basalt-foreground))",
		padding: "8px 12px",
	};
}

export function chartTooltipProps(options?: {
	formatter?: (value: number) => string;
	cursor?: "bar" | "line" | false;
}) {
	const cursor =
		options?.cursor === false
			? false
			: options?.cursor === "line"
				? CHART_TOOLTIP_CURSOR_LINE
				: CHART_TOOLTIP_CURSOR_BAR;
	return {
		isAnimationActive: false,
		animationDuration: 0,
		offset: 12,
		cursor,
		wrapperStyle: {
			outline: "none",
			zIndex: 40,
			pointerEvents: "none" as const,
			transition: "none",
			animation: "none",
		},
		contentStyle: chartTooltipContentStyle(),
		labelStyle: {
			fontSize: chartFontSize("tooltipTitle"),
			color: "hsl(var(--basalt-foreground))",
		},
		itemStyle: chartTextStyle("tooltipBody"),
		formatter: options?.formatter
			? (value: unknown) => options.formatter?.(Number(value))
			: undefined,
	};
}

export function seriesColor(
	series: ChartSeriesDescriptor | undefined,
	index: number,
): string | undefined {
	return series?.color ?? CHART_COLORS[index % CHART_COLORS.length];
}

export const RESPONSIVE_CONTAINER_PROPS = {
	width: "100%" as const,
	height: "100%" as const,
	minWidth: 0,
	minHeight: 0,
	debounce: 150,
};

export const CHART_PLOT_MARGIN = {
	top: 4,
	right: 4,
	bottom: 0,
	left: 0,
} as const;

export const CHART_PLOT_MARGIN_BARE = {
	top: 2,
	right: 2,
	bottom: 2,
	left: 2,
} as const;
