import { loadModuleScenarios } from "../../catalog-scenario";

const CODE_BLOCK_SCENARIO_META = [{ key: "basic", title: "Basic" }] as const;

export const CODE_BLOCK_EXAMPLES = loadModuleScenarios({
	slug: "code-block",
	metas: CODE_BLOCK_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
