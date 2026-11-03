// ViewModel for the Portfolio page.
// Composes model logic with data source — View consumes this hook only.

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { performanceData, portfolio } from "@/data/mock";
import { computePortfolioTotal } from "@/models/portfolio";

export function usePortfolioViewModel() {
	const { t } = useTranslation();
	const totalValue = useMemo(() => computePortfolioTotal(portfolio), []);
	const holdings = useMemo(() => portfolio.map((item) => ({ ...item, name: t(item.name) })), [t]);

	return { totalValue, holdings, performanceData };
}
