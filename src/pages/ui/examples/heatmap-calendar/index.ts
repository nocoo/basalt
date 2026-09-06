import { loadModuleScenarios } from "../../catalog-scenario";

export const HEATMAP_CALENDAR_EXAMPLES = loadModuleScenarios({
	slug: "heatmap-calendar",
	metas: [
		{ key: "default", title: "Default" },
		{ key: "accessible-year", title: "Accessible Year Grid" },
		{ key: "accessible-values", title: "Accessible Values Matrix" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
