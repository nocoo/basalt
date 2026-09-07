import { loadModuleScenarios } from "../../catalog-scenario";
export const EDITABLE_NAV_ITEM_EXAMPLES = loadModuleScenarios({
	slug: "editable-nav-item",
	metas: [
		{ key: "folders", title: "Workspace folders and row actions" },
		{ key: "saved-views", title: "Saved analytics views" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
