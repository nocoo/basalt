import { loadModuleScenarios } from "../../catalog-scenario";

const GRID_SCENARIO_META = [{ key: "grid", title: "Grid" }] as const;

export const GRID_EXAMPLES = loadModuleScenarios({
	slug: "grid",
	metas: GRID_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
