import { describe, expect, it } from "vitest";
import {
	ANIMATION_PROPS,
	AXIS_CONFIG,
	BAR_RADIUS,
	CHART_TYPE,
	cartesianAxisProps,
	chartFontSize,
	chartTextStyle,
	chartTickStyle,
	chartTooltipContentStyle,
	chartTooltipProps,
	GRID_PROPS,
	getChartColor,
	seriesColor,
} from "./config";
import { CHART_COLORS, chartAxis, withAlpha } from "./palette";

describe("chart type helpers", () => {
	it("sets axis ticks smaller than legend and tooltip", () => {
		expect(chartFontSize("axis")).toBe(11);
		expect(chartFontSize("legend")).toBe(12);
		expect(chartFontSize("tooltipTitle")).toBe(12);
		expect(chartFontSize("tooltipBody")).toBe(12);
		expect(chartTextStyle("axis")).toEqual({ fontSize: 11 });
	});

	it("paints ticks with the axis token", () => {
		expect(chartTickStyle()).toEqual({ fontSize: 11, fill: chartAxis });
		expect(AXIS_CONFIG.axisLine).toBe(false);
		expect(AXIS_CONFIG.tickLine).toBe(false);
		expect(AXIS_CONFIG.tick).toEqual({ fontSize: 11, fill: chartAxis });
		expect(cartesianAxisProps(true).hide).toBe(true);
	});

	it("styles grid, tooltip, and legend from the same type scale", () => {
		expect(GRID_PROPS.strokeDasharray).toBe(CHART_TYPE.gridDash);
		expect(GRID_PROPS.strokeOpacity).toBe(CHART_TYPE.gridOpacity);
		expect(chartTooltipContentStyle().fontSize).toBe(12);
		expect(chartTooltipContentStyle().boxShadow).toContain("0 10px 15px");
		expect(chartTooltipProps({ cursor: "line" }).wrapperStyle.outline).toBe("none");
		expect(chartTooltipProps({ cursor: "line" }).wrapperStyle.transition).toBe("none");
		expect(BAR_RADIUS.vertical).toEqual([4, 4, 0, 0]);
		expect(ANIMATION_PROPS.isAnimationActive).toBe(false);
	});

	it("wraps palette colors and alpha tokens", () => {
		expect(getChartColor(0)).toBe(CHART_COLORS[0]);
		expect(getChartColor(CHART_COLORS.length)).toBe(CHART_COLORS[0]);
		expect(withAlpha("chart-axis", 0.15)).toBe("hsl(var(--basalt-chart-axis) / 0.15)");
		expect(seriesColor({ key: "y", color: "rgb(9, 8, 7)" }, 3)).toBe("rgb(9, 8, 7)");
		expect(seriesColor(undefined, 4)).toBe(CHART_COLORS[4]);
	});
});
