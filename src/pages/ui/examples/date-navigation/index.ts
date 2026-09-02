import { loadModuleScenarios } from "../../catalog-scenario";

export const DATE_NAVIGATION_EXAMPLES = loadModuleScenarios({
	slug: "date-navigation",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
