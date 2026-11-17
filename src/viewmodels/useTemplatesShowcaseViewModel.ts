import { useState } from "react";
import type { TemplateFilter, TemplateSlug, TemplateViewport } from "@/models/template-manifest";
import { filterTemplates, getTemplateBySlug } from "@/models/templates";

type Mode = "preview" | "code";

export function useTemplatesShowcaseViewModel() {
	const [filter, setFilter] = useState<TemplateFilter>("all");
	const [modes, setModes] = useState<Partial<Record<TemplateSlug, Mode>>>({});
	const [viewports, setViewports] = useState<Partial<Record<TemplateSlug, TemplateViewport>>>({});
	const [reloadKeys, setReloadKeys] = useState<Partial<Record<TemplateSlug, number>>>({});
	const [copiedSlug, setCopiedSlug] = useState<TemplateSlug | null>(null);
	const [copyError, setCopyError] = useState<TemplateSlug | null>(null);

	async function copySource(
		slug: TemplateSlug,
		writeClipboard = (text: string) => navigator.clipboard.writeText(text),
	) {
		try {
			const entry = getTemplateBySlug(slug);
			if (!entry) throw new Error("Unknown template");
			await writeClipboard(entry.consumerSource);
			setCopiedSlug(slug);
			setCopyError(null);
		} catch {
			setCopiedSlug(null);
			setCopyError(slug);
		}
	}

	return {
		filter,
		setFilter,
		entries: filterTemplates(filter),
		copiedSlug,
		copyError,
		copySource,
		mode: (slug: TemplateSlug) => modes[slug] ?? "preview",
		viewport: (slug: TemplateSlug) => viewports[slug] ?? "desktop",
		reloadKey: (slug: TemplateSlug) => reloadKeys[slug] ?? 0,
		setMode: (slug: TemplateSlug, mode: Mode) =>
			setModes((current) => ({ ...current, [slug]: mode })),
		setViewport: (slug: TemplateSlug, viewport: TemplateViewport) =>
			setViewports((current) => ({ ...current, [slug]: viewport })),
		reload: (slug: TemplateSlug) =>
			setReloadKeys((current) => ({ ...current, [slug]: (current[slug] ?? 0) + 1 })),
	};
}
