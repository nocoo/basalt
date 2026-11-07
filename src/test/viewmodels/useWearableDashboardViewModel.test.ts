import { act, renderHook } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { useWearableDashboardViewModel } from "@/viewmodels/useWearableDashboardViewModel";

const NOW = new Date(2026, 10, 7);

function durationToMinutes(value: string) {
	const match = /^(\d+)h (\d+)m$/.exec(value);
	return match ? Number(match[1]) * 60 + Number(match[2]) : Number.NaN;
}

function renderWearable(now: Date = NOW, locale = "en") {
	return renderHook(() => useWearableDashboardViewModel(i18n.t.bind(i18n), locale, () => now));
}

function kpiSteps(statCards: { value: string }[]) {
	return Number(statCards[0].value.replace(/,/g, ""));
}

beforeAll(async () => {
	await i18n.changeLanguage("en");
});

describe("useWearableDashboardViewModel", () => {
	it("opens on the reference demo day instead of the real today", () => {
		const { result } = renderWearable();
		expect(result.current.selectedIso).toBe("2026-02-13");
		expect(result.current.selectedDate.getDate()).toBe(13);
		expect(result.current.isToday).toBe(false);
	});

	it("shifts one day back and forward and recomputes the day", () => {
		const { result } = renderWearable();
		const before = result.current.statCards.map((card) => card.value);

		act(() => result.current.onPrevDay());
		expect(result.current.selectedIso).toBe("2026-02-12");
		const previous = result.current.statCards.map((card) => card.value);
		expect(previous).not.toEqual(before);

		act(() => result.current.onNextDay());
		expect(result.current.selectedIso).toBe("2026-02-13");
		expect(result.current.statCards.map((card) => card.value)).toEqual(before);
	});

	it("jumps to the injected today and reports it", () => {
		const { result } = renderWearable();
		act(() => result.current.onToday());
		expect(result.current.selectedIso).toBe("2026-11-07");
		expect(result.current.isToday).toBe(true);

		act(() => result.current.onPrevDay());
		expect(result.current.isToday).toBe(false);
	});

	it("describes sleep slots with readable stages and durations", () => {
		const { result } = renderWearable();
		const { sleep } = result.current;
		expect(sleep.slots).toHaveLength(24);
		expect(sleep.slots[0].label).toMatch(/^22:00 · (Deep|Light|REM|Awake)$/);
		for (const slot of sleep.slots) {
			expect(slot.label).toMatch(/^\d{2}:\d{2} · (Deep|Light|REM|Awake)$/);
			expect(slot.height).toBeGreaterThan(0);
			expect(slot.height).toBeLessThanOrEqual(1);
		}
		expect(sleep.legend.map((item) => item.label)).toEqual(["Deep", "Light", "REM", "Awake"]);
		for (const item of sleep.legend) {
			expect(item.value).toMatch(/^\d+h \d+m$/);
		}
		expect(sleep.ariaLabel).toContain("Sleep stages");
	});

	it("keeps the sleep stat aligned with the awake minutes in the legend", () => {
		const { result } = renderWearable();
		const awakeValue = result.current.sleep.legend.find((item) => item.label === "Awake");
		const expectedMinutes = 24 * 20 - durationToMinutes(awakeValue?.value ?? "");
		const sleepCard = result.current.statCards.find((card) => card.metric === "sleep");
		expect(sleepCard?.value).toBe(`${Math.floor(expectedMinutes / 60)}h ${expectedMinutes % 60}m`);
	});

	it("describes heart zones with readable labels and shares", () => {
		const { result } = renderWearable();
		const { heart } = result.current;
		expect(heart.slots).toHaveLength(24);
		for (const slot of heart.slots) {
			expect(slot.label).toMatch(/^\d{2}:00 · (Rest|Easy|Cardio|Peak)$/);
		}
		expect(heart.legend.map((item) => item.label)).toEqual(["Rest", "Easy", "Cardio", "Peak"]);
		const total = heart.legend.reduce((sum, item) => sum + Number(item.value.replace("%", "")), 0);
		expect(total).toBe(100);
		expect(heart.ariaLabel).toContain("Heart rate zones");
	});

	it("derives weekly steps, recovery trend, activity mix and timeline from the day", () => {
		const { result } = renderWearable();
		const { weeklySteps, recoveryTrend, activityBreakdown, timeline, statCards } = result.current;

		expect(weeklySteps).toHaveLength(7);
		expect(recoveryTrend).toHaveLength(4);
		expect(activityBreakdown).toHaveLength(4);
		expect(activityBreakdown.reduce((sum, item) => sum + item.value, 0)).toBe(100);
		expect(timeline).toHaveLength(5);
		for (const event of timeline) {
			expect(event.time).toMatch(/^\d{2}:\d{2}$/);
			expect(event.title).not.toBe("");
			expect(event.subtitle).not.toBe("");
		}
		expect(statCards).toHaveLength(4);
		expect(statCards[2].value).toMatch(/^\d+ bpm$/);
	});

	it("selects repeatable mock days and cycles through the fixtures", () => {
		const first = renderWearable();
		const second = renderWearable();
		expect(second.result.current.weeklySteps).toEqual(first.result.current.weeklySteps);

		const seen = new Set([first.result.current.statCards[0].value]);
		for (let day = 1; day < 3; day += 1) {
			act(() => second.result.current.onNextDay());
			seen.add(second.result.current.statCards[0].value);
			expect(
				second.result.current.heart.legend.reduce(
					(sum, item) => sum + Number(item.value.replace("%", "")),
					0,
				),
			).toBe(100);
		}
		expect(seen.size).toBe(3);

		act(() => second.result.current.onNextDay());
		expect(second.result.current.statCards[0].value).toBe(first.result.current.statCards[0].value);
	});

	it("derives every weekly bar from its own date and keeps overlaps stable", () => {
		const { result } = renderWearable();
		const firstWindow = result.current.weeklySteps.map((point) => point.value);

		expect(result.current.weeklySteps).toHaveLength(7);
		expect(new Set(result.current.weeklySteps.map((point) => point.label)).size).toBe(7);
		expect(firstWindow[6]).toBe(kpiSteps(result.current.statCards));

		let previousWindow = firstWindow;
		for (let day = 0; day < 3; day += 1) {
			expect(result.current.weeklySteps[6].value).toBe(kpiSteps(result.current.statCards));
			act(() => result.current.onNextDay());
			const nextWindow = result.current.weeklySteps.map((point) => point.value);
			expect(nextWindow.slice(0, 6)).toEqual(previousWindow.slice(1));
			previousWindow = nextWindow;
		}
	});

	it("reads the clock when Today is pressed instead of the last render", () => {
		let now = new Date(2026, 10, 7, 23, 59, 30);
		const { result } = renderHook(() =>
			useWearableDashboardViewModel(i18n.t.bind(i18n), "en", () => now),
		);

		now = new Date(2026, 10, 8, 0, 0, 5);
		act(() => result.current.onToday());
		expect(result.current.selectedIso).toBe("2026-11-08");
		expect(result.current.isToday).toBe(true);
	});

	it("refreshes the local today at the next civil midnight", async () => {
		vi.useFakeTimers();
		try {
			let now = new Date(2026, 10, 7, 23, 59, 0);
			const { result } = renderHook(() =>
				useWearableDashboardViewModel(i18n.t.bind(i18n), "en", () => now),
			);
			act(() => result.current.onToday());
			expect(result.current.isToday).toBe(true);

			now = new Date(2026, 10, 8, 0, 0, 1);
			await act(async () => {
				vi.advanceTimersByTime(61_000);
			});
			expect(result.current.selectedIso).toBe("2026-11-07");
			expect(result.current.isToday).toBe(false);

			act(() => result.current.onToday());
			expect(result.current.selectedIso).toBe("2026-11-08");
			expect(result.current.isToday).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it("localizes labels and durations", async () => {
		await i18n.changeLanguage("zh");
		const { result } = renderWearable(NOW, "zh");
		expect(result.current.sleep.legend.map((item) => item.label)).toEqual([
			"深睡",
			"浅睡",
			"快速眼动",
			"清醒",
		]);
		expect(result.current.sleep.legend[0].value).toMatch(/^\d+小时\d+分$/);
		await i18n.changeLanguage("en");
	});
});
