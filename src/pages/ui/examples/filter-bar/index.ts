import { loadModuleScenarios } from "../../catalog-scenario";

export const FILTER_BAR_EXAMPLES = loadModuleScenarios({
	slug: "filter-bar",
	metas: [
		{ key: "resources", title: "Resource search and tags" },
		{ key: "analytics", title: "Analytics period presets" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
