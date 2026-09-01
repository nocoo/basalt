import { loadModuleScenarios } from "../../catalog-scenario";

const FIELD_SCENARIO_META = [
	{ key: "hint", title: "Hint" },
	{ key: "error", title: "Error" },
	{ key: "rich-label-and-optional", title: "Rich label and optional" },
	{ key: "structured-error", title: "Structured error" },
] as const;

export const FIELD_EXAMPLES = loadModuleScenarios({
	slug: "field",
	metas: FIELD_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
