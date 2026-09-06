import { loadModuleScenarios } from "../../catalog-scenario";

export const LINE_EXAMPLES = loadModuleScenarios({
	slug: "line",
	metas: [
		{ key: "default", title: "Default" },
		{ key: "accessible-data", title: "Accessible Data & Summary" },
		{ key: "dynamic-series", title: "Dynamic Multi-Series & Custom Tooltip" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
