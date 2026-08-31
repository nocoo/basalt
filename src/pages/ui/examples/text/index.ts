import { loadModuleScenarios } from "../../catalog-scenario";

const TEXT_SCENARIO_META = [
	{ key: "sizes", title: "Sizes" },
	{ key: "muted-tone", title: "Muted tone" },
] as const;

export const TEXT_EXAMPLES = loadModuleScenarios({
	slug: "text",
	metas: TEXT_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
