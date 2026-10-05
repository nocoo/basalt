import { useState } from "react";
import { contextSourceHref } from "../models/context-cards";

export function useChatMessage(
	content: string,
	sources: readonly { id: string; name: string; type?: string; href?: string }[],
) {
	const [copied, setCopied] = useState<string | null>(null);
	const [copyError, setCopyError] = useState<string | null>(null);
	return {
		copied: copied === content,
		copyError: copyError === content,
		sources: sources.map((source) => ({ ...source, href: contextSourceHref(source.href) })),
		async copy(write: (text: string) => Promise<void>) {
			try {
				await write(content);
				setCopied(content);
				setCopyError(null);
			} catch {
				setCopyError(content);
			}
		},
	};
}
