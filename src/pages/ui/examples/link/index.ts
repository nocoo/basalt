import { loadModuleScenarios } from "../../catalog-scenario";

const LINK_SCENARIO_META = [
	{ key: "basic-link", title: "Basic Link" },
	{ key: "inline-in-paragraph", title: "Inline in Paragraph" },
	{ key: "external-links", title: "External Links" },
] as const;

export const LINK_EXAMPLES = loadModuleScenarios({
	slug: "link",
	metas: LINK_SCENARIO_META,
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
});
