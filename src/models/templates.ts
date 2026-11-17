import type { TemplateViewport } from "./template-manifest";

export function normalizeConsumerTemplateSource(raw: string): string {
	return raw
		.replace(/^\uFEFF?[ \t]*\/\*[\s\S]*?\*\/[ \t]*(?:\r?\n|$)/, "")
		.replace(/^[ \t]*\/\/[ \t]*(?:@ts-\S+|preview helper).*?(?:\r?\n|$)/gim, "")
		.trim();
}

export function viewportContainerClass(viewport: TemplateViewport): string {
	return {
		desktop: "w-full",
		tablet: "mx-auto w-full max-w-[48rem]",
		mobile: "mx-auto w-full max-w-[24.375rem]",
	}[viewport];
}
