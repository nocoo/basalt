import { loadModuleScenarios } from "../../catalog-scenario";

export const FILE_DROPZONE_EXAMPLES = loadModuleScenarios({
	slug: "file-dropzone",
	metas: [
		{ key: "documents", title: "Reference document intake" },
		{ key: "media", title: "Cover image with preview cleanup" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
