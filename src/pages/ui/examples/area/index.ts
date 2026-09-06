import { loadModuleScenarios } from "../../catalog-scenario";

export const AREA_EXAMPLES = loadModuleScenarios({
	slug: "area",
	metas: [
		{ key: "default", title: "Default" },
		{ key: "dynamic-series", title: "Dynamic Multi-Series & Stack Offset" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
