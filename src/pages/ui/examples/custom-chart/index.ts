import { loadModuleScenarios } from "../../catalog-scenario";

export const CUSTOM_CHART_EXAMPLES = loadModuleScenarios({
	slug: "custom-chart",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
