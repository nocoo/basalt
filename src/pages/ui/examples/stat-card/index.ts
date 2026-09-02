import { loadModuleScenarios } from "../../catalog-scenario";

export const STAT_CARD_EXAMPLES = loadModuleScenarios({
	slug: "stat-card",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
