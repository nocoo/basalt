import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
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
});
