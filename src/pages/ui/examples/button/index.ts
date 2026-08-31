import { loadModuleScenarios } from "../../catalog-scenario";

const BUTTON_SCENARIO_META = [
	{ key: "variants", title: "Variants" },
	{ key: "sizes", title: "Sizes" },
	{ key: "with-icon", title: "With Icon" },
	{ key: "icon-only", title: "Icon Only" },
	{ key: "loading-state", title: "Loading State" },
	{ key: "disabled-state", title: "Disabled State" },
	{ key: "title", title: "Title" },
	{ key: "link-as-button", title: "Link as Button" },
	{ key: "link-with-tooltip", title: "Link with Tooltip" },
	{ key: "disabled-link", title: "Disabled Link" },
] as const;

export const BUTTON_EXAMPLES = loadModuleScenarios({
	slug: "button",
	metas: BUTTON_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
