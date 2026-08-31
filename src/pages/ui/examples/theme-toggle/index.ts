import { loadModuleScenarios } from "../../catalog-scenario";

const THEME_TOGGLE_SCENARIO_META = [{ key: "default", title: "Default" }] as const;

export const THEME_TOGGLE_EXAMPLES = loadModuleScenarios({
	slug: "theme-toggle",
	metas: THEME_TOGGLE_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
