import { act, renderHook } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { useWearableDashboardViewModel } from "@/viewmodels/useWearableDashboardViewModel";

const previousTimeZone = process.env.TZ;

beforeAll(async () => {
	process.env.TZ = "America/New_York";
	await i18n.changeLanguage("en");
});

afterAll(() => {
	if (previousTimeZone === undefined) {
		delete process.env.TZ;
	} else {
		process.env.TZ = previousTimeZone;
	}
});

afterEach(() => vi.useRealTimers());

function renderOn(iso: string) {
	const [year, month, day] = iso.split("-").map(Number);
	const now = new Date(year, month - 1, day, 12);
	return {
		now,
		...renderHook(() => useWearableDashboardViewModel(i18n.t.bind(i18n), "en", () => now)),
	};
}

function kpiSteps(value: string) {
	return Number(value.replace(/,/g, ""));
}

describe("useWearableDashboardViewModel around DST", () => {
	it("runs under a DST-observing timezone", () => {
		expect(new Date(2026, 2, 7, 12).getTimezoneOffset()).toBe(300);
		expect(new Date(2026, 2, 8, 12).getTimezoneOffset()).toBe(240);
		expect(new Date(2026, 10, 1, 12).getTimezoneOffset()).toBe(300);
	});

	it("keeps the weekly window aligned across spring forward", () => {
		const { result } = renderOn("2026-03-08");
		act(() => result.current.onToday());
		expect(result.current.selectedIso).toBe("2026-03-08");
		expect(result.current.weeklySteps[6].value).toBe(kpiSteps(result.current.statCards[0].value));
		expect(new Set(result.current.weeklySteps.map((point) => point.label)).size).toBe(7);

		const marchWindow = result.current.weeklySteps.map((point) => point.value);
		act(() => result.current.onPrevDay());
		expect(result.current.selectedIso).toBe("2026-03-07");
		const weekBefore = result.current.weeklySteps.map((point) => point.value);
		expect(marchWindow.slice(0, 6)).toEqual(weekBefore.slice(1));
		expect(result.current.weeklySteps[6].value).toBe(kpiSteps(result.current.statCards[0].value));
	});

	it("keeps the weekly window aligned across fall back", () => {
		const { result } = renderOn("2026-11-01");
		act(() => result.current.onToday());
		expect(result.current.selectedIso).toBe("2026-11-01");
		expect(result.current.weeklySteps[6].value).toBe(kpiSteps(result.current.statCards[0].value));
		expect(new Set(result.current.weeklySteps.map((point) => point.label)).size).toBe(7);

		const novemberWindow = result.current.weeklySteps.map((point) => point.value);
		act(() => result.current.onPrevDay());
		expect(result.current.selectedIso).toBe("2026-10-31");
		const octoberWindow = result.current.weeklySteps.map((point) => point.value);
		expect(novemberWindow.slice(0, 6)).toEqual(octoberWindow.slice(1));
	});

	it.each([
		{ month: 2, day: 8, hours: 23, next: "2026-03-09" },
		{ month: 10, day: 1, hours: 25, next: "2026-11-02" },
	])("rolls over after $hours hours at the next civil midnight", ({ month, day, hours, next }) => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, month, day));
		const clock = () => new Date();
		const { result, unmount } = renderHook(() =>
			useWearableDashboardViewModel(i18n.t.bind(i18n), "en", clock),
		);
		act(() => result.current.onToday());
		expect(result.current.isToday).toBe(true);
		act(() => vi.advanceTimersByTime(hours * 3_600_000 - 1));
		expect(result.current.isToday).toBe(true);
		act(() => vi.advanceTimersByTime(1));
		expect(result.current.isToday).toBe(false);
		act(() => result.current.onToday());
		expect(result.current.selectedIso).toBe(next);
		expect(result.current.isToday).toBe(true);
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
