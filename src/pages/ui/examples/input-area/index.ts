import { loadModuleScenarios } from "../../catalog-scenario";

const INPUT_AREA_SCENARIO_META = [
	{ key: "with-label", title: "With Label" },
	{ key: "custom-row-count", title: "Custom Row Count" },
	{ key: "error-state-string", title: "Error State (String)" },
	{ key: "disabled", title: "Disabled" },
] as const;

export const INPUT_AREA_EXAMPLES = loadModuleScenarios({
	slug: "input-area",
	metas: INPUT_AREA_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
