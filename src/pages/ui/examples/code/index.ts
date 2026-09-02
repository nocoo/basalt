import { loadModuleScenarios } from "../../catalog-scenario";

const CODE_SCENARIO_META = [
	{ key: "typescript", title: "TypeScript" },
	{ key: "react", title: "React" },
	{ key: "inline", title: "Inline" },
] as const;

export const CODE_EXAMPLES = loadModuleScenarios({
	slug: "code",
	metas: CODE_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
