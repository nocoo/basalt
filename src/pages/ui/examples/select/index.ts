import { loadModuleScenarios } from "../../catalog-scenario";

const SELECT_SCENARIO_META = [
	{ key: "basic", title: "Basic" },
	{ key: "placeholder", title: "Placeholder" },
	{ key: "disabled-options", title: "Disabled Options" },
	{ key: "sizes", title: "Sizes" },
	{ key: "loading", title: "Loading" },
	{ key: "groups", title: "Groups" },
	{ key: "controlled-and-error", title: "Controlled and error" },
] as const;

export const SELECT_EXAMPLES = loadModuleScenarios({
	slug: "select",
	metas: SELECT_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
