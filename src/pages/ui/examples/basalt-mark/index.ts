import { loadModuleScenarios } from "../../catalog-scenario";

const BASALT_MARK_SCENARIO_META = [{ key: "default", title: "Default" }] as const;

export const BASALT_MARK_EXAMPLES = loadModuleScenarios({
	slug: "basalt-mark",
	metas: BASALT_MARK_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
