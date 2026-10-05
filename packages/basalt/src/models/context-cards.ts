export type ContextChunk = {
	id: string;
	title: string;
	body: string;
	source: { name: string; type: string; href?: string };
	/** Optional full-document character count; defaults to the displayed text length. */
	characters?: number;
};

export function contextSourceHref(href: string | undefined): string | undefined {
	if (
		!href ||
		href !== href.trim() ||
		Array.from(href).some((char) => char.charCodeAt(0) <= 32 || char === "\\")
	)
		return undefined;
	if (href.startsWith("/") && !href.startsWith("//")) return href;
	try {
		const url = new URL(href);
		return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
			? url.href
			: undefined;
	} catch {
		return undefined;
	}
}
