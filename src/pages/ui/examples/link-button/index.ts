import { loadModuleScenarios } from "../../catalog-scenario";

const LINK_BUTTON_SCENARIO_META = [
	{ key: "default", title: "Default" },
	{ key: "disabled-link", title: "Disabled Link" },
] as const;

export const LINK_BUTTON_EXAMPLES = loadModuleScenarios({
	slug: "link-button",
	metas: LINK_BUTTON_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
