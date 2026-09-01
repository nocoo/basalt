import { loadModuleScenarios } from "../../catalog-scenario";

const STAT_STRIP_SCENARIO_META = [
	{ key: "overview", title: "Overview" },
	{ key: "loading-values", title: "Loading values" },
] as const;

export const STAT_STRIP_EXAMPLES = loadModuleScenarios({
	slug: "stat-strip",
	metas: STAT_STRIP_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
