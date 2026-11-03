// ViewModel for analytics stat cards (used by DashboardPage).
// Composes model logic with data source — View consumes this hook only.

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { analyticsStats } from "@/data/mock";
import { changeToColorClass, classifyChange } from "@/models/stats-overview";

export interface StatCard {
	label: string;
	value: string;
	change: string;
	changeColorClass: string;
}

export function useStatsOverviewViewModel() {
	const { t } = useTranslation();
	const stats: StatCard[] = useMemo(
		() =>
			analyticsStats.map((s) => ({
				label: t(s.labelKey),
				value: s.valueKey ? t(s.valueKey) : s.value,
				change: s.change,
				changeColorClass: changeToColorClass(classifyChange(s.change)),
			})),
		[t],
	);

	return { stats };
}
