import { isKnownTemplateSlug, type TemplateSlug } from "./template-manifest";

export interface TemplateThemeMessage {
	type: "basalt-template-theme";
	theme: "light" | "dark";
}

export interface TemplateFocusMessage {
	type: "basalt-template-focus";
	partId: string;
}

export type TemplateParentMessage = TemplateThemeMessage | TemplateFocusMessage;

export interface TemplateActivePartMessage {
	type: "basalt-template-active-part";
	slug: TemplateSlug;
	partId: string;
}

export interface TemplateReadyMessage {
	type: "basalt-template-ready";
	slug: TemplateSlug;
}

export type TemplateChildMessage = TemplateActivePartMessage | TemplateReadyMessage;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function createTemplateThemeMessage(theme: "light" | "dark"): TemplateThemeMessage {
	return { type: "basalt-template-theme", theme };
}

export function createTemplateFocusMessage(partId: string): TemplateFocusMessage {
	return { type: "basalt-template-focus", partId };
}

export function createTemplateActivePartMessage(
	slug: TemplateSlug,
	partId: string,
): TemplateActivePartMessage {
	return { type: "basalt-template-active-part", slug, partId };
}

export function createTemplateReadyMessage(slug: TemplateSlug): TemplateReadyMessage {
	return { type: "basalt-template-ready", slug };
}

export function parseTemplateParentMessage(data: unknown): TemplateParentMessage | null {
	if (!isRecord(data) || typeof data.type !== "string") {
		return null;
	}
	if (data.type === "basalt-template-theme") {
		if (data.theme === "light" || data.theme === "dark") {
			return { type: "basalt-template-theme", theme: data.theme };
		}
		return null;
	}
	if (data.type === "basalt-template-focus") {
		if (typeof data.partId === "string" && data.partId.length > 0) {
			return { type: "basalt-template-focus", partId: data.partId };
		}
		return null;
	}
	return null;
}

export function parseTemplateChildMessage(data: unknown): TemplateChildMessage | null {
	if (!isRecord(data) || typeof data.type !== "string") {
		return null;
	}
	if (typeof data.slug !== "string" || !isKnownTemplateSlug(data.slug)) {
		return null;
	}
	if (data.type === "basalt-template-ready") {
		return { type: "basalt-template-ready", slug: data.slug };
	}
	if (
		data.type === "basalt-template-active-part" &&
		typeof data.partId === "string" &&
		data.partId.length > 0
	) {
		return { type: "basalt-template-active-part", slug: data.slug, partId: data.partId };
	}
	return null;
}
