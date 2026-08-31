import { loadModuleScenarios } from "../../catalog-scenario";

const SEPARATOR_SCENARIO_META = [{ key: "horizontal", title: "Horizontal" }] as const;

export const SEPARATOR_EXAMPLES = loadModuleScenarios({
	slug: "separator",
	metas: SEPARATOR_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
