import { loadModuleScenarios } from "../../catalog-scenario";

const INPUT_SCENARIO_META = [
	{ key: "with-label-and-description", title: "With Label and Description" },
	{ key: "with-error-string", title: "With Error (String)" },
	{ key: "disabled", title: "Disabled" },
	{ key: "input-types", title: "Input Types" },
	{ key: "bare-input-no-label", title: "Bare Input (No Label)" },
	{ key: "sizes", title: "Sizes" },
	{ key: "controlled-and-reset", title: "Controlled and reset" },
] as const;

export const INPUT_EXAMPLES = loadModuleScenarios({
	slug: "input",
	metas: INPUT_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
