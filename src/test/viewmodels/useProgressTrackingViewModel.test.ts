import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import { useProgressTrackingViewModel } from "@/viewmodels/useProgressTrackingViewModel";

describe("useProgressTrackingViewModel", () => {
	it("returns summary with correct shape", () => {
		const { result } = renderHook(() => useProgressTrackingViewModel());
		const { summary } = result.current;
		expect(summary).toHaveProperty("totalSpent");
		expect(summary).toHaveProperty("totalLimit");
		expect(summary).toHaveProperty("remaining");
		expect(summary.remaining).toBe(summary.totalLimit - summary.totalSpent);
	});

	it("returns categories with progress and color", () => {
		const { result } = renderHook(() => useProgressTrackingViewModel());
		const { categories } = result.current;
		expect(categories.length).toBeGreaterThan(0);
		for (const cat of categories) {
			expect(cat).toHaveProperty("category");
			expect(cat).toHaveProperty("progress");
			expect(cat).toHaveProperty("color");
			expect(cat.progress).toBeGreaterThanOrEqual(0);
		}
	});

	it("updates budget categories when the language changes", async () => {
		const previous = i18n.language;
		const { result, unmount } = renderHook(() => useProgressTrackingViewModel());
		try {
			await act(async () => i18n.changeLanguage("zh"));
			expect(result.current.categories[0].category).toBe("营养与餐饮");
			await act(async () => i18n.changeLanguage("en"));
			expect(result.current.categories[0].category).toBe("Nutrition & Dining");
		} finally {
			unmount();
			await i18n.changeLanguage(previous);
		}
	});

	it("returns comparisonData as array", () => {
		const { result } = renderHook(() => useProgressTrackingViewModel());
		expect(Array.isArray(result.current.comparisonData)).toBe(true);
	});
});
