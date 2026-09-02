import { loadModuleScenarios } from "../../catalog-scenario";

export const LINE_EXAMPLES = loadModuleScenarios({
	slug: "line",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
