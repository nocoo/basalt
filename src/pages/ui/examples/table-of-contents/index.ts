import { loadModuleScenarios } from "../../catalog-scenario";

const TABLE_OF_CONTENTS_SCENARIO_META = [
	{ key: "options", title: "Options" },
	{ key: "no-active-item", title: "No active item" },
	{ key: "without-title", title: "Without title" },
] as const;

export const TABLE_OF_CONTENTS_EXAMPLES = loadModuleScenarios({
	slug: "table-of-contents",
	metas: TABLE_OF_CONTENTS_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
