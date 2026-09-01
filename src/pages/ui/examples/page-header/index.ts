import { loadModuleScenarios } from "../../catalog-scenario";

const PAGE_HEADER_SCENARIO_META = [
	{ key: "default", title: "Default" },
	{ key: "long-responsive-content", title: "Long responsive content" },
] as const;

export const PAGE_HEADER_EXAMPLES = loadModuleScenarios({
	slug: "page-header",
	metas: PAGE_HEADER_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
