import { describe, it, expect } from "vitest";
import {
  countActiveEvents,
  computeTotalCalories,
  classifyTrend,
  shiftDate,
} from "@/models/life-ai";
import type { LifeAiTimelineEvent, LifeAiStat } from "@/models/types";

describe("countActiveEvents", () => {
  it("counts only events with a color", () => {
    const events: LifeAiTimelineEvent[] = [
      { id: "1", time: "07:00", title: "Run", color: "bg-green-500" },
      { id: "2", time: "08:00", title: "Breakfast" },
      { id: "3", time: "17:00", title: "Gym", color: "bg-blue-500" },
    ];
    expect(countActiveEvents(events)).toBe(2);
  });

  it("returns 0 for empty array", () => {
    expect(countActiveEvents([])).toBe(0);
  });

  it("returns 0 when no events have color", () => {
    const events: LifeAiTimelineEvent[] = [
      { id: "1", time: "08:00", title: "Breakfast" },
    ];
    expect(countActiveEvents(events)).toBe(0);
  });
});

describe("computeTotalCalories", () => {
  it("extracts and sums kcal from subtitles", () => {
    const events: LifeAiTimelineEvent[] = [
      { id: "1", time: "08:00", title: "Breakfast", subtitle: "420 kcal" },
      { id: "2", time: "12:00", title: "Lunch", subtitle: "680 kcal" },
      { id: "3", time: "09:00", title: "Work" },
    ];
    expect(computeTotalCalories(events)).toBe(1100);
  });

  it("returns 0 for empty array", () => {
    expect(computeTotalCalories([])).toBe(0);
  });

  it("ignores events without kcal pattern", () => {
    const events: LifeAiTimelineEvent[] = [
      { id: "1", time: "07:00", title: "Run", subtitle: "5 km" },
    ];
    expect(computeTotalCalories(events)).toBe(0);
  });
});

describe("classifyTrend", () => {
  it("returns positive for positive trend", () => {
    const stat: LifeAiStat = { title: "Steps", value: 8000, trend: { value: 5 } };
    expect(classifyTrend(stat)).toBe("positive");
  });

  it("returns negative for negative trend", () => {
    const stat: LifeAiStat = { title: "Sleep", value: "7h", trend: { value: -3.2 } };
    expect(classifyTrend(stat)).toBe("negative");
  });

  it("returns neutral for zero trend", () => {
    const stat: LifeAiStat = { title: "HR", value: 72, trend: { value: 0 } };
    expect(classifyTrend(stat)).toBe("neutral");
  });

  it("returns neutral when no trend", () => {
    const stat: LifeAiStat = { title: "HR", value: 72 };
    expect(classifyTrend(stat)).toBe("neutral");
  });
});

describe("shiftDate", () => {
  it("shifts forward by positive days", () => {
    const base = new Date(2026, 1, 13); // Feb 13
    const result = shiftDate(base, 1);
    expect(result.getDate()).toBe(14);
  });

  it("shifts backward by negative days", () => {
    const base = new Date(2026, 1, 13);
    const result = shiftDate(base, -1);
    expect(result.getDate()).toBe(12);
  });

  it("does not mutate the original date", () => {
    const base = new Date(2026, 1, 13);
    shiftDate(base, 5);
    expect(base.getDate()).toBe(13);
  });
});
