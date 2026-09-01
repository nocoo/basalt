import { loadModuleScenarios } from "../../catalog-scenario";

const SEGMENT_CONTROL_SCENARIO_META = [
	{ key: "controlled-status", title: "Controlled status filter" },
	{ key: "overflow-disabled", title: "Overflow and disabled" },
] as const;

export const SEGMENT_CONTROL_EXAMPLES = loadModuleScenarios({
	slug: "segment-control",
	metas: SEGMENT_CONTROL_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
