import { loadModuleScenarios } from "../../catalog-scenario";

export const DONUT_EXAMPLES = loadModuleScenarios({
	slug: "donut",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
