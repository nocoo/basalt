import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useChatMessage } from "./use-chat-message";

it("validates source URLs and ties copy feedback to the exact message", async () => {
	const { result, rerender } = renderHook(
		({ content }) =>
			useChatMessage(content, [{ id: "one", name: "Report", href: "javascript:alert(1)" }]),
		{ initialProps: { content: "First" } },
	);
	expect(result.current.sources[0].href).toBeUndefined();
	await act(async () => result.current.copy(vi.fn().mockRejectedValue(new Error("Denied"))));
	expect(result.current.copyError).toBe(true);
	await act(async () => result.current.copy(vi.fn().mockResolvedValue(undefined)));
	expect(result.current.copied).toBe(true);
	expect(result.current.copyError).toBe(false);
	rerender({ content: "Second" });
	expect(result.current.copied).toBe(false);
});
