import { loadModuleScenarios } from "../../catalog-scenario";

const PAGINATION_SCENARIO_META = [
	{ key: "full-controls-default", title: "Full Controls (Default)" },
	{ key: "simple-controls", title: "Simple Controls" },
	{ key: "mid-page-state", title: "Mid-Page State" },
] as const;

export const PAGINATION_EXAMPLES = loadModuleScenarios({
	slug: "pagination",
	metas: PAGINATION_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
