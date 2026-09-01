import { loadModuleScenarios } from "../../catalog-scenario";

const SIDEBAR_SCENARIO_META = [
	{ key: "default", title: "Default" },
	{ key: "provider", title: "Provider" },
] as const;

export const SIDEBAR_EXAMPLES = loadModuleScenarios({
	slug: "sidebar",
	metas: SIDEBAR_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
