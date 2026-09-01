import { loadModuleScenarios } from "../../catalog-scenario";

const SWITCH_SCENARIO_META = [
	{ key: "off-state", title: "Off State" },
	{ key: "on-state", title: "On State" },
	{ key: "disabled", title: "Disabled" },
	{ key: "sizes", title: "Sizes" },
	{ key: "group-and-legend", title: "Group and legend" },
	{ key: "controlled-and-error", title: "Controlled and error" },
] as const;

export const SWITCH_EXAMPLES = loadModuleScenarios({
	slug: "switch",
	metas: SWITCH_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
