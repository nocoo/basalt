import { loadModuleScenarios } from "../../catalog-scenario";
export const TAG_BADGE_EXAMPLES = loadModuleScenarios({
	slug: "tag-badge",
	metas: [
		{ key: "deterministic", title: "Stable resource tag colors" },
		{ key: "semantic", title: "Explicit status colors and palette" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
