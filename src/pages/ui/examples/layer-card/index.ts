import { loadModuleScenarios } from "../../catalog-scenario";

const LAYER_CARD_SCENARIO_META = [
	{ key: "basic-card", title: "Basic Card" },
	{ key: "surface-style-card", title: "Surface-style Card" },
	{ key: "multiple-cards", title: "Multiple Cards" },
	{ key: "structured-card", title: "Structured Card" },
	{ key: "loading-empty", title: "Loading and Empty" },
	{ key: "nested-surfaces", title: "Nested Surfaces" },
] as const;

export const LAYER_CARD_EXAMPLES = loadModuleScenarios({
	slug: "layer-card",
	metas: LAYER_CARD_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
