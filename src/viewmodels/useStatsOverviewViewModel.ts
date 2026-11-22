// ViewModel for analytics stat cards (used by DashboardPage).
// Composes model logic with data source — View consumes this hook only.

import { useMemo } from "react";
import { analyticsStats } from "@/data/mock";
import { type ChangeDirection, classifyChange } from "@/models/stats-overview";

export interface StatCard {
	label: string;
	value: string;
	change: string;
	direction: ChangeDirection;
}

export function useStatsOverviewViewModel() {
	const stats: StatCard[] = useMemo(
		() =>
			analyticsStats.map((s) => ({
				label: s.label,
				value: s.value,
				change: s.change,
				direction: classifyChange(s.change),
			})),
		[],
	);

	return { stats };
}
