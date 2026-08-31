import { loadModuleScenarios } from "../../catalog-scenario";

const SENSITIVE_INPUT_SCENARIO_META = [
	{ key: "default", title: "Default" },
	{ key: "disabled", title: "Disabled" },
] as const;

export const SENSITIVE_INPUT_EXAMPLES = loadModuleScenarios({
	slug: "sensitive-input",
	metas: SENSITIVE_INPUT_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
