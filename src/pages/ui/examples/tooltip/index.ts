import { loadModuleScenarios } from "../../catalog-scenario";

const TOOLTIP_SCENARIO_META = [
	{ key: "basic-tooltip", title: "Basic Tooltip" },
	{ key: "multiple-tooltips", title: "Multiple Tooltips" },
] as const;

export const TOOLTIP_EXAMPLES = loadModuleScenarios({
	slug: "tooltip",
	metas: TOOLTIP_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
