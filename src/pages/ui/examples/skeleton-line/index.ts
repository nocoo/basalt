import { loadModuleScenarios } from "../../catalog-scenario";

export const SKELETON_COMPOSITION_EXAMPLES = loadModuleScenarios({
	slug: "skeleton-line",
	metas: [
		{ key: "dashboard", title: "Analytics Dashboard" },
		{ key: "resource-list", title: "Resource List & Leaderboard" },
		{ key: "resource-detail", title: "Resource Detail" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
