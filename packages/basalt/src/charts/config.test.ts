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
		expect(chartFontSize("axis")).toBe("var(--basalt-text-xs)");
		expect(chartFontSize("legend")).toBe("var(--basalt-text-sm)");
		expect(chartFontSize("tooltipTitle")).toBe("var(--basalt-text-sm)");
		expect(chartFontSize("tooltipBody")).toBe("var(--basalt-text-sm)");
		expect(chartTextStyle("axis")).toEqual({ fontSize: "var(--basalt-text-xs)" });
	});

	it("paints ticks with the axis token", () => {
		expect(chartTickStyle()).toEqual({ fontSize: "var(--basalt-text-xs)", fill: chartAxis });
		expect(AXIS_CONFIG.axisLine).toBe(false);
		expect(AXIS_CONFIG.tickLine).toBe(false);
		expect(AXIS_CONFIG.tick).toEqual({ fontSize: "var(--basalt-text-xs)", fill: chartAxis });
		expect(cartesianAxisProps(true).hide).toBe(true);
	});

	it("styles grid, tooltip, and legend from the same type scale", () => {
		expect(GRID_PROPS.strokeDasharray).toBe(CHART_TYPE.gridDash);
		expect(GRID_PROPS.strokeOpacity).toBe(CHART_TYPE.gridOpacity);
		expect(chartTooltipContentStyle().padding).toBe("0");
		expect(chartTooltipContentStyle().background).toBe("transparent");
		expect(chartTooltipProps({ cursor: "line" }).wrapperStyle.outline).toBe("none");
		expect(chartTooltipProps({ cursor: "line" }).wrapperStyle.transition).toBe("none");
		expect(chartTooltipProps({ cursor: "line" }).content).toBeTypeOf("function");
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
