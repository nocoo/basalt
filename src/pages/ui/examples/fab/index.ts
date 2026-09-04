import { loadModuleScenarios } from "../../catalog-scenario";

export const FAB_EXAMPLES = loadModuleScenarios({
	slug: "fab",
	metas: [
		{ key: "closed", title: "Closed" },
		{ key: "open", title: "Open" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
