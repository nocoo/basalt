import { loadModuleScenarios } from "../../catalog-scenario";

const AUTOCOMPLETE_SCENARIO_META = [
	{ key: "default", title: "Default" },
	{ key: "disabled", title: "Disabled" },
	{ key: "controlled-and-reset", title: "Controlled and reset" },
] as const;

export const AUTOCOMPLETE_EXAMPLES = loadModuleScenarios({
	slug: "autocomplete",
	metas: AUTOCOMPLETE_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
