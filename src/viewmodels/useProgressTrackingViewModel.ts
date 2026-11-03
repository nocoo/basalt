// ViewModel for the Progress Tracking page.
// Composes model logic with data source — View consumes this hook only.

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { budgets, monthlyBudgetData } from "@/data/mock";
import { CHART_COLORS } from "@/lib/palette";
import { computeProgressPercent, computeProgressSummary } from "@/models/progress-tracking";

export interface CategoryProgress {
	category: string;
	spent: number;
	limit: number;
	progress: number;
	color: string;
}

export function useProgressTrackingViewModel() {
	const { t } = useTranslation();
	const summary = useMemo(() => computeProgressSummary(budgets), []);

	const categories: CategoryProgress[] = useMemo(
		() =>
			budgets.map((b, i) => ({
				category: t(b.category),
				spent: b.spent,
				limit: b.limit,
				progress: computeProgressPercent(b.spent, b.limit),
				color: CHART_COLORS[i % CHART_COLORS.length],
			})),
		[t],
	);

	return { summary, categories, comparisonData: monthlyBudgetData };
}
