import { loadModuleScenarios } from "../../catalog-scenario";

export const HEATMAP_CALENDAR_EXAMPLES = loadModuleScenarios({
	slug: "heatmap-calendar",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
