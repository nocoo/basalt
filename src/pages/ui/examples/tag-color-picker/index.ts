import { loadModuleScenarios } from "../../catalog-scenario";
export const TAG_COLOR_PICKER_EXAMPLES = loadModuleScenarios({
	slug: "tag-color-picker",
	metas: [
		{ key: "tag-editor", title: "Tag editor and live preview" },
		{ key: "status-colors", title: "Service status subset" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
