import { loadModuleScenarios } from "../../catalog-scenario";

const COMBOBOX_SCENARIO_META = [
	{ key: "default", title: "Default" },
	{ key: "disabled", title: "Disabled" },
	{ key: "sizes", title: "Sizes" },
	{ key: "controlled-and-error", title: "Controlled and error" },
] as const;

export const COMBOBOX_EXAMPLES = loadModuleScenarios({
	slug: "combobox",
	metas: COMBOBOX_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
