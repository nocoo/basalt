import { loadModuleScenarios } from "../../catalog-scenario";

const INPUT_GROUP_SCENARIO_META = [
	{ key: "inline-suffix", title: "Inline Suffix" },
	{ key: "icon", title: "Icon" },
	{ key: "text", title: "Text" },
	{ key: "button", title: "Button" },
	{ key: "loading", title: "Loading" },
] as const;

export const INPUT_GROUP_EXAMPLES = loadModuleScenarios({
	slug: "input-group",
	metas: INPUT_GROUP_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
