import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getTemplateBySlug } from "@/lib/template-catalog";
import { useTemplatesShowcaseViewModel } from "@/viewmodels/useTemplatesShowcaseViewModel";

describe("useTemplatesShowcaseViewModel", () => {
	it("keeps filter, display mode, viewport and reload state independent", () => {
		const { result } = renderHook(() => useTemplatesShowcaseViewModel());
		expect(result.current.filter).toBe("all");
		expect(result.current.entries).toHaveLength(5);
		expect(result.current.mode("agent-workspace")).toBe("preview");
		expect(result.current.viewport("agent-workspace")).toBe("desktop");
		expect(result.current.reloadKey("agent-workspace")).toBe(0);
		act(() => {
			result.current.setFilter("featured");
			result.current.setMode("agent-workspace", "code");
			result.current.setViewport("agent-workspace", "mobile");
			result.current.reload("agent-workspace");
			result.current.reload("agent-workspace");
		});
		expect(result.current.entries).toHaveLength(4);
		expect(result.current.mode("agent-workspace")).toBe("code");
		expect(result.current.viewport("agent-workspace")).toBe("mobile");
		expect(result.current.reloadKey("agent-workspace")).toBe(2);
		expect(result.current.mode("ops-inbox")).toBe("preview");
		expect(result.current.viewport("ops-inbox")).toBe("desktop");
		expect(result.current.reloadKey("ops-inbox")).toBe(0);
	});
	it("copies source and reports clipboard failures", async () => {
		const { result } = renderHook(() => useTemplatesShowcaseViewModel());
		const write = vi.fn().mockResolvedValue(undefined);
		await act(() => result.current.copySource("agent-workspace", write));
		expect(write).toHaveBeenCalledWith(getTemplateBySlug("agent-workspace")?.consumerSource);
		expect(result.current.copiedSlug).toBe("agent-workspace");
		expect(result.current.copyError).toBeNull();
		await act(() =>
			result.current.copySource("ops-inbox", vi.fn().mockRejectedValue(new Error("denied"))),
		);
		expect(result.current.copiedSlug).toBeNull();
		expect(result.current.copyError).toBe("ops-inbox");
		await act(() => result.current.copySource("unknown" as "ops-inbox", write));
		expect(result.current.copyError).toBe("unknown");
		const clipboard = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: clipboard },
		});
		await act(() => result.current.copySource("visitor-login"));
		expect(clipboard).toHaveBeenCalledOnce();
		expect(result.current.copiedSlug).toBe("visitor-login");
		expect(result.current.copyError).toBeNull();
	});
});
