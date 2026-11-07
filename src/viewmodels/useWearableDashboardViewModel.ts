// ViewModel for the Wearable dashboard page.
// The selected day picks one of three repeatable mock fixtures; nothing is simulated.

import type { TFunction } from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";

const REFERENCE_ISO = "2026-02-13";
const GOAL_STEPS = 14000;
const SLEEP_SLOT_MINUTES = 20;
const SLEEP_SLOT_COUNT = 24;
const SLEEP_START_HOUR = 22;

export type WearableMetric = "steps" | "calories" | "heartRate" | "sleep";

export interface WearableStatCard {
	metric: WearableMetric;
	title: string;
	value: string;
	subtitle: string;
	trend: { value: number; label: string };
}

export interface WearableSlot {
	color: string;
	height: number;
	label: string;
}

export interface WearableLegendItem {
	label: string;
	swatch: string;
	value: string;
}

const SLEEP_STAGES = {
	deep: { swatch: "bg-basalt-primary", height: 0.62 },
	light: { swatch: "bg-basalt-primary/60", height: 0.88 },
	rem: { swatch: "bg-basalt-success", height: 0.72 },
	awake: { swatch: "bg-basalt-warning", height: 0.22 },
} as const;

const HEART_ZONES = {
	rest: { swatch: "bg-basalt-success", height: 0.3 },
	easy: { swatch: "bg-basalt-warning/60", height: 0.55 },
	cardio: { swatch: "bg-basalt-warning", height: 0.78 },
	peak: { swatch: "bg-basalt-destructive", height: 1 },
} as const;

type SleepStage = keyof typeof SLEEP_STAGES;
type HeartZone = keyof typeof HEART_ZONES;

const SLEEP_ORDER = Object.keys(SLEEP_STAGES) as SleepStage[];
const HEART_ORDER = Object.keys(HEART_ZONES) as HeartZone[];

const SLEEP_LABEL_KEY: Record<SleepStage, string> = {
	deep: "pages.wearable.sleepStageDeep",
	light: "pages.wearable.sleepStageLight",
	rem: "pages.wearable.sleepStageRem",
	awake: "pages.wearable.sleepStageAwake",
};

const HEART_LABEL_KEY: Record<HeartZone, string> = {
	rest: "pages.wearable.heartZoneRest",
	easy: "pages.wearable.heartZoneEasy",
	cardio: "pages.wearable.heartZoneCardio",
	peak: "pages.wearable.heartZonePeak",
};

interface DayFixture {
	sleep: [SleepStage, number][];
	heart: [HeartZone, number][];
	steps: number;
	calories: number;
	restingBpm: number;
	consistency: number;
	trends: [number, number, number, number];
	recovery: number[];
	activity: [number, number, number, number];
	timeline: [string, number, string, string, string, number, string, number, string];
}

const DAY_FIXTURES: DayFixture[] = [
	{
		sleep: [
			["light", 4],
			["deep", 5],
			["light", 3],
			["rem", 5],
			["awake", 1],
			["rem", 6],
		],
		heart: [
			["rest", 9],
			["easy", 3],
			["rest", 7],
			["peak", 1],
			["cardio", 1],
			["rest", 3],
		],
		steps: 12480,
		calories: 2460,
		restingBpm: 62,
		consistency: 84,
		trends: [5.2, 3.1, -1.4, 2.6],
		recovery: [72, 78, 82, 86],
		activity: [42, 28, 18, 12],
		timeline: ["06:10", 86, "07:30", "3.2", "12:40", 600, "18:10", 45, "21:30"],
	},
	{
		sleep: [
			["light", 4],
			["deep", 4],
			["light", 2],
			["awake", 2],
			["rem", 4],
			["deep", 3],
			["rem", 5],
		],
		heart: [
			["rest", 6],
			["easy", 4],
			["rest", 8],
			["peak", 1],
			["cardio", 1],
			["rest", 4],
		],
		steps: 9860,
		calories: 2180,
		restingBpm: 66,
		consistency: 76,
		trends: [-2.4, -1.1, 1.8, -3.2],
		recovery: [64, 69, 71, 74],
		activity: [34, 36, 16, 14],
		timeline: ["06:45", 74, "08:05", "2.4", "11:50", 400, "19:20", 35, "22:10"],
	},
	{
		sleep: [
			["light", 3],
			["deep", 6],
			["light", 4],
			["rem", 5],
			["light", 2],
			["rem", 4],
		],
		heart: [
			["rest", 7],
			["easy", 3],
			["rest", 7],
			["peak", 2],
			["cardio", 2],
			["rest", 3],
		],
		steps: 14320,
		calories: 2710,
		restingBpm: 58,
		consistency: 91,
		trends: [8.4, 6.2, -2.7, 4.1],
		recovery: [81, 86, 90, 93],
		activity: [46, 24, 22, 8],
		timeline: ["05:50", 92, "07:10", "4.1", "13:20", 800, "17:40", 60, "21:00"],
	},
];

const REFERENCE_DAYS = Math.floor(Date.UTC(2026, 1, 13) / 86_400_000);

function pad(value: number) {
	return String(value).padStart(2, "0");
}

function toIso(date: Date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isoToDate(iso: string) {
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function shiftIso(iso: string, days: number) {
	const date = isoToDate(iso);
	date.setDate(date.getDate() + days);
	return toIso(date);
}

function fixtureFor(iso: string) {
	const [year, month, day] = iso.split("-").map(Number);
	const offset = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000) - REFERENCE_DAYS;
	return DAY_FIXTURES[((offset % DAY_FIXTURES.length) + DAY_FIXTURES.length) % DAY_FIXTURES.length];
}

function expandRuns<T>(runs: [T, number][]) {
	return runs.flatMap(([value, count]) => Array.from({ length: count }, () => value));
}

function countOf<T>(values: T[], value: T) {
	return values.filter((entry) => entry === value).length;
}

function formatDuration(t: TFunction, minutes: number) {
	return t("pages.wearable.duration", {
		hours: Math.floor(minutes / 60),
		minutes: minutes % 60,
	});
}

function buildSleep(t: TFunction, fixture: DayFixture) {
	const stages = expandRuns(fixture.sleep);
	const slots: WearableSlot[] = stages.map((stage, index) => {
		const clock = (SLEEP_START_HOUR * 60 + index * SLEEP_SLOT_MINUTES) % 1440;
		return {
			color: SLEEP_STAGES[stage].swatch,
			height: SLEEP_STAGES[stage].height,
			label: `${pad(Math.floor(clock / 60))}:${pad(clock % 60)} · ${t(SLEEP_LABEL_KEY[stage])}`,
		};
	});
	const legend: WearableLegendItem[] = SLEEP_ORDER.map((stage) => ({
		label: t(SLEEP_LABEL_KEY[stage]),
		swatch: SLEEP_STAGES[stage].swatch,
		value: formatDuration(t, countOf(stages, stage) * SLEEP_SLOT_MINUTES),
	}));
	return {
		slots,
		legend,
		ariaLabel: `${t("pages.wearable.sleepStages")}: ${legend
			.map((item) => `${item.label} ${item.value}`)
			.join(", ")}`,
		minutes: SLEEP_SLOT_COUNT * SLEEP_SLOT_MINUTES - countOf(stages, "awake") * SLEEP_SLOT_MINUTES,
	};
}

function buildHeart(t: TFunction, fixture: DayFixture) {
	const zones = expandRuns(fixture.heart);
	const slots: WearableSlot[] = zones.map((zone, index) => ({
		color: HEART_ZONES[zone].swatch,
		height: HEART_ZONES[zone].height,
		label: `${pad(index)}:00 · ${t(HEART_LABEL_KEY[zone])}`,
	}));
	const legend: WearableLegendItem[] = HEART_ORDER.map((zone) => ({
		label: t(HEART_LABEL_KEY[zone]),
		swatch: HEART_ZONES[zone].swatch,
		value: `${Math.round((countOf(zones, zone) / SLEEP_SLOT_COUNT) * 100)}%`,
	}));
	return {
		slots,
		legend,
		ariaLabel: `${t("pages.wearable.heartRateZones")}: ${legend
			.map((item) => `${item.label} ${item.value}`)
			.join(", ")}`,
	};
}

function buildTimeline(t: TFunction, fixture: DayFixture) {
	const [wake, recoveryScore, walk, distance, hydration, water, training, minutes, windDown] =
		fixture.timeline;
	const textColor = "hsl(var(--basalt-foreground))";
	return [
		{
			time: wake,
			title: t("pages.wearable.wakeUp"),
			subtitle: t("pages.wearable.recoveryScore", { score: recoveryScore }),
			color: "bg-basalt-primary/10",
		},
		{
			time: walk,
			title: t("pages.wearable.morningWalk"),
			subtitle: `${distance} km`,
			color: "bg-basalt-success/10",
		},
		{
			time: hydration,
			title: t("pages.wearable.hydration"),
			subtitle: `${water} ml`,
			color: "bg-basalt-info/10",
		},
		{
			time: training,
			title: t("pages.wearable.training"),
			subtitle: t("pages.wearable.strengthMinutes", { minutes }),
			color: "bg-basalt-warning/10",
		},
		{
			time: windDown,
			title: t("pages.wearable.windDown"),
			subtitle: t("pages.wearable.stretchBreath"),
			color: "bg-basalt-info/10",
		},
	].map((event, index) => ({ ...event, id: `t${index + 1}`, textColor }));
}

function buildDay(t: TFunction, locale: string, iso: string) {
	const fixture = fixtureFor(iso);
	const sleep = buildSleep(t, fixture);
	const number = new Intl.NumberFormat(locale);
	const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
	const week = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

	const statCards: WearableStatCard[] = [
		{
			metric: "steps",
			title: t("pages.wearable.steps"),
			value: number.format(fixture.steps),
			subtitle: t("pages.wearable.goal", { goal: number.format(GOAL_STEPS) }),
			trend: { value: fixture.trends[0], label: t("common.vsLastWeek") },
		},
		{
			metric: "calories",
			title: t("pages.wearable.calories"),
			value: number.format(fixture.calories),
			subtitle: t("pages.wearable.activeBurn"),
			trend: { value: fixture.trends[1], label: t("common.vsLastWeek") },
		},
		{
			metric: "heartRate",
			title: t("pages.wearable.heartRate"),
			value: t("pages.wearable.bpmValue", { bpm: fixture.restingBpm }),
			subtitle: t("pages.wearable.restingAvg"),
			trend: { value: fixture.trends[2], label: t("common.vsLastWeek") },
		},
		{
			metric: "sleep",
			title: t("pages.wearable.sleep"),
			value: formatDuration(t, sleep.minutes),
			subtitle: t("pages.wearable.consistency", { percent: fixture.consistency }),
			trend: { value: fixture.trends[3], label: t("common.vsLastWeek") },
		},
	];

	return {
		statCards,
		sleep,
		heart: buildHeart(t, fixture),
		weeklySteps: Array.from({ length: 7 }, (_, index) => {
			const date = shiftIso(iso, index - 6);
			return { label: weekday.format(isoToDate(date)), value: fixtureFor(date).steps };
		}),
		recoveryTrend: fixture.recovery.map((value, index) => ({
			label: week.format(isoToDate(shiftIso(iso, (index - 3) * 7))),
			value,
		})),
		activityBreakdown: [
			t("pages.wearable.activityWalking"),
			t("pages.wearable.activityTraining"),
			t("pages.wearable.activityYoga"),
			t("pages.wearable.activityRecovery"),
		].map((label, index) => ({ label, value: fixture.activity[index] })),
		timeline: buildTimeline(t, fixture),
	};
}

const systemClock = () => new Date();

export function useWearableDashboardViewModel(
	t: TFunction,
	locale: string,
	clock: () => Date = systemClock,
) {
	const [selectedIso, setSelectedIso] = useState(REFERENCE_ISO);
	const [todayIso, setTodayIso] = useState(() => toIso(clock()));

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		function scheduleRollover() {
			const now = clock();
			const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
			timer = setTimeout(
				() => {
					setTodayIso(toIso(clock()));
					scheduleRollover();
				},
				Math.max(nextMidnight.getTime() - now.getTime(), 0),
			);
		}
		scheduleRollover();
		return () => clearTimeout(timer);
	}, [clock]);

	const onPrevDay = useCallback(() => setSelectedIso((iso) => shiftIso(iso, -1)), []);
	const onNextDay = useCallback(() => setSelectedIso((iso) => shiftIso(iso, 1)), []);
	const onToday = useCallback(() => {
		const freshIso = toIso(clock());
		setTodayIso(freshIso);
		setSelectedIso(freshIso);
	}, [clock]);

	const day = useMemo(() => buildDay(t, locale, selectedIso), [t, locale, selectedIso]);

	return {
		...day,
		selectedIso,
		selectedDate: useMemo(() => isoToDate(selectedIso), [selectedIso]),
		isToday: selectedIso === todayIso,
		onPrevDay,
		onNextDay,
		onToday,
	};
}
