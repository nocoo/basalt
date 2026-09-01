import { loadModuleScenarios } from "../../catalog-scenario";

const FLOW_SCENARIO_META = [{ key: "sequential-flow", title: "Sequential Flow" }] as const;

export const FLOW_EXAMPLES = loadModuleScenarios({
	slug: "flow",
	metas: FLOW_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
