import { loadModuleScenarios } from "../../catalog-scenario";

const DATA_TABLE_SCENARIO_META = [
	{ key: "default", title: "Default" },
	{ key: "loading", title: "Loading" },
	{ key: "empty", title: "Empty" },
	{ key: "selection", title: "Selection" },
	{ key: "pagination", title: "Pagination" },
] as const;

export const DATA_TABLE_EXAMPLES = loadModuleScenarios({
	slug: "data-table",
	metas: DATA_TABLE_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
