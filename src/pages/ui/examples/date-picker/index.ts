import { loadModuleScenarios } from "../../catalog-scenario";

const DATE_PICKER_SCENARIO_META = [
	{ key: "single-date-selection", title: "Single Date Selection" },
	{ key: "disabled-dates", title: "Disabled dates" },
	{ key: "presets", title: "Presets" },
	{ key: "range", title: "Range" },
] as const;

export const DATE_PICKER_EXAMPLES = loadModuleScenarios({
	slug: "date-picker",
	metas: DATE_PICKER_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
