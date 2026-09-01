import { loadModuleScenarios } from "../../catalog-scenario";

const CONFIRM_DIALOG_SCENARIO_META = [
	{ key: "controlled-async-loading", title: "Controlled async loading" },
	{ key: "promise-result", title: "Promise result" },
] as const;

export const CONFIRM_DIALOG_EXAMPLES = loadModuleScenarios({
	slug: "confirm-dialog",
	metas: CONFIRM_DIALOG_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
