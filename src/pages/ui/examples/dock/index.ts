import { loadModuleScenarios } from "../../catalog-scenario";

export const DOCK_EXAMPLES = loadModuleScenarios({
	slug: "dock",
	metas: [
		{ key: "push", title: "Push" },
		{ key: "overlay", title: "Overlay" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
