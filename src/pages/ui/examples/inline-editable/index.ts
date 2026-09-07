import { loadModuleScenarios } from "../../catalog-scenario";
export const INLINE_EDITABLE_EXAMPLES = loadModuleScenarios({
	slug: "inline-editable",
	metas: [
		{ key: "resource-name", title: "Resource name with async save" },
		{ key: "caption", title: "Optional caption with explicit save" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
