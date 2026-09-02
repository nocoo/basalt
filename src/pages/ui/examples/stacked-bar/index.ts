import { loadModuleScenarios } from "../../catalog-scenario";

export const STACKED_BAR_EXAMPLES = loadModuleScenarios({
	slug: "stacked-bar",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
