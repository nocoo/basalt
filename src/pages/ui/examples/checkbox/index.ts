import { loadModuleScenarios } from "../../catalog-scenario";

const CHECKBOX_SCENARIO_META = [
	{ key: "default", title: "Default" },
	{ key: "checked", title: "Checked" },
	{ key: "indeterminate", title: "Indeterminate" },
	{ key: "disabled", title: "Disabled" },
	{ key: "error", title: "Error" },
	{ key: "group-and-legend", title: "Group and legend" },
	{ key: "controlled-and-error", title: "Controlled and error" },
] as const;

export const CHECKBOX_EXAMPLES = loadModuleScenarios({
	slug: "checkbox",
	metas: CHECKBOX_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
