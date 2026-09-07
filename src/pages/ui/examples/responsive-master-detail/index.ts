import { loadModuleScenarios } from "../../catalog-scenario";
export const RESPONSIVE_MASTER_DETAIL_EXAMPLES = loadModuleScenarios({
	slug: "responsive-master-detail",
	metas: [
		{ key: "resources", title: "Resource browser and detail editor" },
		{ key: "drafts", title: "Draft workspace with retained state" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
