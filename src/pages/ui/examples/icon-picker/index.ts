import { loadModuleScenarios } from "../../catalog-scenario";
export const ICON_PICKER_EXAMPLES = loadModuleScenarios({
	slug: "icon-picker",
	metas: [
		{ key: "folder-icon", title: "Folder appearance" },
		{ key: "resource-icon", title: "Resource classification" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
