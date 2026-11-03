import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import { usePortfolioViewModel } from "@/viewmodels/usePortfolioViewModel";

describe("usePortfolioViewModel", () => {
	it("returns totalValue as sum of holdings", () => {
		const { result } = renderHook(() => usePortfolioViewModel());
		const sum = result.current.holdings.reduce((s, h) => s + h.value, 0);
		expect(result.current.totalValue).toBe(sum);
	});

	it("returns non-empty holdings and performanceData", () => {
		const { result } = renderHook(() => usePortfolioViewModel());
		expect(result.current.holdings.length).toBeGreaterThan(0);
		expect(result.current.performanceData.length).toBe(12);
	});

	it("updates fund labels when the language changes", async () => {
		const previous = i18n.language;
		const { result, unmount } = renderHook(() => usePortfolioViewModel());
		try {
			await act(async () => i18n.changeLanguage("zh"));
			expect(result.current.holdings[0].name).toBe("基础护理基金");
			await act(async () => i18n.changeLanguage("en"));
			expect(result.current.holdings[0].name).toBe("Primary care fund");
		} finally {
			unmount();
			await i18n.changeLanguage(previous);
		}
	});

	it("holdings have all required fields", () => {
		const { result } = renderHook(() => usePortfolioViewModel());
		for (const h of result.current.holdings) {
			expect(h).toHaveProperty("name");
			expect(h).toHaveProperty("value");
			expect(h).toHaveProperty("allocation");
			expect(h).toHaveProperty("change");
			expect(h).toHaveProperty("up");
		}
	});
});
