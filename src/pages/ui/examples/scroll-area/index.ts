import { loadModuleScenarios } from "../../catalog-scenario";

const SCROLL_AREA_SCENARIO_META = [
	{ key: "vertical-list", title: "Vertical list" },
	{ key: "horizontal-row", title: "Horizontal row" },
] as const;

export const SCROLL_AREA_EXAMPLES = loadModuleScenarios({
	slug: "scroll-area",
	metas: SCROLL_AREA_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
