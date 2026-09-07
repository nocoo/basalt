import { loadModuleScenarios } from "../../catalog-scenario";

export const UPLOAD_QUEUE_EXAMPLES = loadModuleScenarios({
	slug: "upload-queue",
	metas: [
		{ key: "local-transport", title: "Progress, cancellation and retry" },
		{ key: "audio-review", title: "Recording import review" },
	],
	renderModules: import.meta.glob("./*.tsx", { eager: true }),
	sourceModules: import.meta.glob("./*.tsx", { query: "?raw", import: "default", eager: true }),
});
