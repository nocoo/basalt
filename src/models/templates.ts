import {
	TEMPLATE_MANIFEST,
	type TemplateMetadata,
	type TemplateSlug,
	type TemplateViewport,
} from "./template-manifest";

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

export function getTemplateByManifestSlug(slug: string): TemplateMetadata | undefined {
	return TEMPLATE_MANIFEST.find((entry) => entry.slug === slug);
}

export function getTemplateNeighbors(slug: TemplateSlug): {
	prev?: TemplateMetadata;
	next?: TemplateMetadata;
} {
	const index = TEMPLATE_MANIFEST.findIndex((entry) => entry.slug === slug);
	if (index === -1) {
		return {};
	}
	return {
		prev: index > 0 ? TEMPLATE_MANIFEST[index - 1] : undefined,
		next: index < TEMPLATE_MANIFEST.length - 1 ? TEMPLATE_MANIFEST[index + 1] : undefined,
	};
}

export function resolveTemplateComponents(template: TemplateMetadata): readonly string[] {
	const unique = new Set<string>();
	for (const part of template.parts) {
		for (const component of part.components) {
			unique.add(component);
		}
	}
	return [...unique].sort((a, b) => a.localeCompare(b, "en"));
}
