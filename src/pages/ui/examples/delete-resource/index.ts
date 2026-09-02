import { loadModuleScenarios } from "../../catalog-scenario";

export const DELETE_RESOURCE_EXAMPLES = loadModuleScenarios({
	slug: "delete-resource",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
