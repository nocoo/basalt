import { loadModuleScenarios } from "../../catalog-scenario";

export const CHART_COLORS_EXAMPLES = loadModuleScenarios({
	slug: "chart-colors",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
