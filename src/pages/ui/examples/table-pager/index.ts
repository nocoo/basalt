import { loadModuleScenarios } from "../../catalog-scenario";

const TABLE_PAGER_SCENARIO_META = [
	{ key: "range-navigation", title: "Range navigation" },
	{ key: "disabled-and-localized", title: "Disabled and localized" },
] as const;

export const TABLE_PAGER_EXAMPLES = loadModuleScenarios({
	slug: "table-pager",
	metas: TABLE_PAGER_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
