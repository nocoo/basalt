import { loadModuleScenarios } from "../../catalog-scenario";

export const FUNNEL_EXAMPLES = loadModuleScenarios({
	slug: "funnel",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
