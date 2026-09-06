import { loadModuleScenarios } from "../../catalog-scenario";

const EMPTY_SCENARIO_META = [{ key: "action-states", title: "Action States" }] as const;

export const EMPTY_ACTION_EXAMPLES = loadModuleScenarios({
	slug: "empty",
	metas: EMPTY_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
