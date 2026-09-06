import { loadModuleScenarios } from "../../catalog-scenario";

export const STAT_CARD_EXAMPLES = loadModuleScenarios({
	slug: "stat-card",
	metas: [
		{ key: "default", title: "Default" },
		{ key: "metric-info", title: "Metric Info & Custom Trend" },
		{ key: "state-transition", title: "State Transitions & Retry" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
