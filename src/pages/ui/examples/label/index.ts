import { loadModuleScenarios } from "../../catalog-scenario";

const LABEL_SCENARIO_META = [
	{ key: "default-label", title: "Default Label" },
	{ key: "optional-field", title: "Optional Field" },
	{ key: "with-tooltip", title: "With Tooltip" },
] as const;

export const LABEL_EXAMPLES = loadModuleScenarios({
	slug: "label",
	metas: LABEL_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
