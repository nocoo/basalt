import { loadModuleScenarios } from "../../catalog-scenario";

export const MULTI_SELECT_EXAMPLES = loadModuleScenarios({
	slug: "multi-select",
	metas: [
		{ key: "folders", title: "Folder organization" },
		{ key: "remote-search", title: "Remote model search" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
