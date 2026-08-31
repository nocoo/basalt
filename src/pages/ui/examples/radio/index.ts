import { loadModuleScenarios } from "../../catalog-scenario";

const RADIO_SCENARIO_META = [
	{ key: "default-vertical", title: "Default (Vertical)" },
	{ key: "horizontal", title: "Horizontal" },
	{ key: "disabled", title: "Disabled" },
] as const;

export const RADIO_EXAMPLES = loadModuleScenarios({
	slug: "radio",
	metas: RADIO_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
