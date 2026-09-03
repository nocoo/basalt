import { loadModuleScenarios } from "../../catalog-scenario";

const DESCRIPTION_LIST_SCENARIO_META = [{ key: "default", title: "Default" }] as const;

export const DESCRIPTION_LIST_EXAMPLES = loadModuleScenarios({
	slug: "description-list",
	metas: DESCRIPTION_LIST_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
