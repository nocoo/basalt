import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStatsOverviewViewModel } from "@/viewmodels/useStatsOverviewViewModel";

describe("useStatsOverviewViewModel", () => {
	it("returns stats with semantic trend direction", () => {
		const { result } = renderHook(() => useStatsOverviewViewModel());
		const { stats } = result.current;
		expect(stats.length).toBeGreaterThan(0);
		expect(stats[0].label).toBe("Avg. daily care spend");
		expect(stats[3].value).toBe("Nutrition");
		for (const s of stats) {
			expect(s).toHaveProperty("label");
			expect(s).toHaveProperty("value");
			expect(["positive", "negative", "neutral"]).toContain(s.direction);
		}
	});
});
