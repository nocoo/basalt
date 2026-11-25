import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getTemplateBySlug } from "@/lib/template-catalog";
import { useTemplateWorkbenchViewModel } from "@/viewmodels/useTemplateWorkbenchViewModel";

describe("useTemplateWorkbenchViewModel", () => {
	it("manages mode, viewport, local theme override, reload, and active part selection", () => {
		const { result, rerender } = renderHook(
			({
				slug,
				siteTheme,
			}: {
				slug: "agent-workspace" | "ops-inbox";
				siteTheme: "light" | "dark";
			}) => useTemplateWorkbenchViewModel(slug, siteTheme),
			{ initialProps: { slug: "agent-workspace", siteTheme: "light" } },
		);

		expect(result.current.entry?.slug).toBe("agent-workspace");
		expect(result.current.mode).toBe("preview");
		expect(result.current.viewport).toBe("desktop");
		expect(result.current.themeOverride).toBe("site");
		expect(result.current.effectiveTheme).toBe("light");
		expect(result.current.reloadKey).toBe(0);
		expect(result.current.activePartId).toBe("agent-sidebar");

		act(() => {
			result.current.setMode("code");
			result.current.setViewport("mobile");
			result.current.setThemeOverride("dark");
			result.current.reload();
			result.current.reload();
		});
		expect(result.current.mode).toBe("code");
		expect(result.current.viewport).toBe("mobile");
		expect(result.current.effectiveTheme).toBe("dark");
		expect(result.current.reloadKey).toBe(2);

		act(() => {
			result.current.selectPart("agent-approval");
		});
		expect(result.current.mode).toBe("preview");
		expect(result.current.activePartId).toBe("agent-approval");

		rerender({ slug: "ops-inbox", siteTheme: "dark" });
		expect(result.current.entry?.slug).toBe("ops-inbox");
		expect(result.current.activePartId).toBe("ops-sidebar");
		expect(result.current.themeOverride).toBe("site");
		expect(result.current.effectiveTheme).toBe("dark");
	});

	it("copies standalone source and reports clipboard failures cleanly", async () => {
		const { result } = renderHook(() => useTemplateWorkbenchViewModel("ops-inbox", "light"));
		const write = vi.fn().mockResolvedValue(undefined);
		await act(() => result.current.copySource(write));
		expect(write).toHaveBeenCalledWith(getTemplateBySlug("ops-inbox")?.consumerSource);
		expect(result.current.copied).toBe(true);
		expect(result.current.copyError).toBe(false);

		await act(() =>
			result.current.copySource(vi.fn().mockRejectedValue(new Error("clipboard denied"))),
		);
		expect(result.current.copied).toBe(false);
		expect(result.current.copyError).toBe(true);

		const clipboard = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: clipboard },
		});
		await act(() => result.current.copySource());
		expect(clipboard).toHaveBeenCalledOnce();
		expect(result.current.copied).toBe(true);
		expect(result.current.copyError).toBe(false);

		const unknown = renderHook(() =>
			useTemplateWorkbenchViewModel("unknown" as "ops-inbox", "light"),
		);
		await act(() => unknown.result.current.copySource(write));
		expect(unknown.result.current.copyError).toBe(true);
	});
});
