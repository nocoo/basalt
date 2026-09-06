import { loadModuleScenarios } from "../../catalog-scenario";

export const HEATMAP_MATRIX_EXAMPLES = loadModuleScenarios({
	slug: "heatmap-matrix",
	metas: [
		{ key: "hour-schedule", title: "Weekly Hour Schedule Matrix" },
		{ key: "service-grid", title: "Cross-Service Latency Matrix" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
