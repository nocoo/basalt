import { type ContextChunk, contextSourceHref } from "../models/context-cards";

export function useContextCardsViewModel(chunks: readonly ContextChunk[], totalCount?: number) {
	return {
		count:
			totalCount !== undefined && Number.isFinite(totalCount)
				? Math.max(chunks.length, Math.floor(totalCount))
				: chunks.length,
		chunks: chunks.map((chunk, index) => ({
			...chunk,
			characters:
				chunk.characters !== undefined && Number.isFinite(chunk.characters)
					? Math.max(0, Math.floor(chunk.characters))
					: Array.from(chunk.body).length,
			href: contextSourceHref(chunk.source.href),
			delay: Math.min(index, 4) * 60,
		})),
	};
}
