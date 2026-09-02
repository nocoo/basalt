import { loadModuleScenarios } from "../../catalog-scenario";

const PAGINATION_SCENARIO_META = [
	{ key: "full-controls-default", title: "Full Controls (Default)" },
	{ key: "simple-controls", title: "Simple Controls" },
	{ key: "mid-page-state", title: "Mid-Page State" },
	{ key: "uncontrolled", title: "Uncontrolled" },
	{ key: "disabled", title: "Disabled" },
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
