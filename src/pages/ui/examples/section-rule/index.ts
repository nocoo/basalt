import { loadModuleScenarios } from "../../catalog-scenario";

export const SECTION_RULE_EXAMPLES = loadModuleScenarios({
	slug: "section-rule",
	metas: [
		{ key: "default", title: "Default" },
		{ key: "with-hint", title: "With hint" },
		{ key: "with-actions", title: "With actions" },
		{ key: "with-hint-and-actions", title: "Hint and actions" },
		{ key: "stacked-regions", title: "Stacked regions" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
