import { describe, expect, it } from "vitest";
import { applyLeadColor, resolveChartSeries, xyFallbackKeys } from "./series";

describe("Chart series utilities", () => {
	it("resolveChartSeries returns series if non-empty, otherwise maps fallbackKeys", () => {
		const custom = [{ key: "metric1", label: "Metric 1" }];
		expect(resolveChartSeries(custom, ["defaultKey"])).toBe(custom);

		expect(resolveChartSeries([], ["fallbackA", "fallbackB"])).toEqual([
			{ key: "fallbackA" },
			{ key: "fallbackB" },
		]);

		expect(resolveChartSeries(undefined, ["y"])).toEqual([{ key: "y" }]);
	});

	it("applyLeadColor applies lead color only to index 0 when item.color is undefined, preserves existing color, keeps subsequent items unchanged, and does nothing without color", () => {
		const itemsWithoutColor = [{ key: "a" }, { key: "b", color: "rgb(0, 0, 255)" }];
		const colored = applyLeadColor(itemsWithoutColor, "rgb(255, 0, 0)");
		expect(colored[0]?.color).toBe("rgb(255, 0, 0)");
		// Non-first item is preserved exactly
		expect(colored[1]).toBe(itemsWithoutColor[1]);
		expect(colored[1]?.color).toBe("rgb(0, 0, 255)");

		// Does not overwrite existing item.color on index 0
		const itemsWithColor = [{ key: "a", color: "rgb(0, 255, 0)" }, { key: "b" }];
		const preserved = applyLeadColor(itemsWithColor, "rgb(255, 0, 0)");
		expect(preserved[0]?.color).toBe("rgb(0, 255, 0)");
		expect(preserved[1]).toBe(itemsWithColor[1]);

		// Returns items as-is when color is undefined
		expect(applyLeadColor(itemsWithoutColor, undefined)).toBe(itemsWithoutColor);
	});

	it("xyFallbackKeys inspects dataset for y2 and y3 presence", () => {
		expect(xyFallbackKeys([{}])).toEqual(["y"]);
		expect(xyFallbackKeys([{ y2: 20 }])).toEqual(["y", "y2"]);
		expect(xyFallbackKeys([{ y3: 30 }])).toEqual(["y", "y3"]);
		expect(xyFallbackKeys([{ y2: 20, y3: 30 }])).toEqual(["y", "y2", "y3"]);
	});
});
