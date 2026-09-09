import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "@/hooks/use-mobile";

afterEach(() => vi.unstubAllGlobals());

describe("useIsMobile", () => {
	it.each([
		[390, true],
		[767, true],
		[768, false],
		[1440, false],
	])("uses the %ipx layout on the first render", (width, mobile) => {
		vi.stubGlobal("innerWidth", width);
		const renders: boolean[] = [];
		renderHook(() => {
			const isMobile = useIsMobile();
			renders.push(isMobile);
		});
		expect(renders[0]).toBe(mobile);
	});

	it("updates the layout when crossing the sidebar breakpoint", () => {
		vi.stubGlobal("innerWidth", 390);
		const media = new EventTarget();
		vi.stubGlobal("matchMedia", () => media);
		const { result } = renderHook(useIsMobile);
		expect(result.current).toBe(true);
		act(() => {
			vi.stubGlobal("innerWidth", 1280);
			media.dispatchEvent(new Event("change"));
		});
		expect(result.current).toBe(false);
		act(() => {
			vi.stubGlobal("innerWidth", 390);
			media.dispatchEvent(new Event("change"));
		});
		expect(result.current).toBe(true);
	});
});
