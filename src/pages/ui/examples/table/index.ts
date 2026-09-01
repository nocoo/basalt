import { loadModuleScenarios } from "../../catalog-scenario";

const TABLE_SCENARIO_META = [
	{ key: "basic", title: "Basic" },
	{ key: "selected-row", title: "Selected Row" },
] as const;

export const TABLE_EXAMPLES = loadModuleScenarios({
	slug: "table",
	metas: TABLE_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
