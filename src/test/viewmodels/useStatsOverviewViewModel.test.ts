import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import { useStatsOverviewViewModel } from "@/viewmodels/useStatsOverviewViewModel";

describe("useStatsOverviewViewModel", () => {
	it("returns stats with changeColorClass", () => {
		const { result } = renderHook(() => useStatsOverviewViewModel());
		const { stats } = result.current;
		expect(stats.length).toBeGreaterThan(0);
		for (const s of stats) {
			expect(s).toHaveProperty("label");
			expect(s).toHaveProperty("value");
			expect(s).toHaveProperty("changeColorClass");
			expect(s.changeColorClass).toMatch(/^text-/);
		}
	});

	it("updates the metric labels and focus value when the language changes", async () => {
		const previous = i18n.language;
		const { result, unmount } = renderHook(() => useStatsOverviewViewModel());
		try {
			await act(async () => i18n.changeLanguage("zh"));
			expect(result.current.stats[0].label).toBe("平均每日护理支出");
			expect(result.current.stats[3].value).toBe("营养");
			await act(async () => i18n.changeLanguage("en"));
			expect(result.current.stats[0].label).toBe("Avg. daily care spend");
			expect(result.current.stats[3].value).toBe("Nutrition");
		} finally {
			unmount();
			await i18n.changeLanguage(previous);
		}
	});
});
