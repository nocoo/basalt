import { useEffect, useState } from "react";
import { getTemplateBySlug } from "@/lib/template-catalog";
import type { TemplateSlug, TemplateViewport } from "@/models/template-manifest";

export type WorkbenchMode = "preview" | "code";
export type PreviewThemeOverride = "site" | "light" | "dark";

export function useTemplateWorkbenchViewModel(
	slug: TemplateSlug,
	resolvedSiteTheme: "light" | "dark",
) {
	const entry = getTemplateBySlug(slug);
	const defaultPartId = entry?.parts[0]?.id ?? "";

	const [mode, setMode] = useState<WorkbenchMode>("preview");
	const [viewport, setViewport] = useState<TemplateViewport>("desktop");
	const [themeOverride, setThemeOverride] = useState<PreviewThemeOverride>("site");
	const [reloadKey, setReloadKey] = useState(0);
	const [activePartId, setActivePartId] = useState(defaultPartId);
	const [copied, setCopied] = useState(false);
	const [copyError, setCopyError] = useState(false);

	useEffect(() => {
		setMode("preview");
		setViewport("desktop");
		setThemeOverride("site");
		setReloadKey(0);
		setActivePartId(defaultPartId);
		setCopied(false);
		setCopyError(false);
	}, [defaultPartId]);

	const effectiveTheme: "light" | "dark" =
		themeOverride === "site" ? resolvedSiteTheme : themeOverride;

	async function copySource(
		writeClipboard = (text: string) => navigator.clipboard.writeText(text),
	) {
		try {
			const current = getTemplateBySlug(slug);
			if (!current) throw new Error("Unknown template");
			await writeClipboard(current.consumerSource);
			setCopied(true);
			setCopyError(false);
		} catch {
			setCopied(false);
			setCopyError(true);
		}
	}

	function selectPart(partId: string) {
		setMode("preview");
		setActivePartId(partId);
	}

	function reload() {
		setReloadKey((current) => current + 1);
	}

	return {
		entry,
		mode,
		setMode,
		viewport,
		setViewport,
		themeOverride,
		setThemeOverride,
		effectiveTheme,
		reloadKey,
		reload,
		activePartId,
		setActivePartId,
		selectPart,
		copied,
		copyError,
		copySource,
	};
}
