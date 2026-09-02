import { loadModuleScenarios } from "../../catalog-scenario";

export const ITEM_LIST_EXAMPLES = loadModuleScenarios({
	slug: "item-list",
	metas: [{ key: "default", title: "Default" }],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
