import { loadModuleScenarios } from "../../catalog-scenario";

const TEXTAREA_SCENARIO_META = [
	{ key: "with-label", title: "With Label" },
	{ key: "custom-row-count", title: "Custom Row Count" },
	{ key: "auto-resize", title: "Auto Resize" },
	{ key: "error-state-string", title: "Error State (String)" },
	{ key: "disabled", title: "Disabled" },
	{ key: "sizes", title: "Sizes" },
	{ key: "controlled-and-reset", title: "Controlled and reset" },
] as const;

export const TEXTAREA_EXAMPLES = loadModuleScenarios({
	slug: "textarea",
	metas: TEXTAREA_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
