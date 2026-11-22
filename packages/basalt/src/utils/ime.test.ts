import { describe, expect, it } from "vitest";
import { isImeComposing } from "./ime";

describe("isImeComposing", () => {
	it("detects native and synthetic IME composition states including Safari keyCode 229", () => {
		expect(isImeComposing({ key: "Enter", nativeEvent: { isComposing: false } })).toBe(false);
		expect(isImeComposing({ key: "Enter", nativeEvent: { isComposing: true } })).toBe(true);
		expect(isImeComposing({ key: "Enter", isComposing: true })).toBe(true);
		expect(isImeComposing({ key: "Enter", nativeEvent: { keyCode: 229 } })).toBe(true);
		expect(isImeComposing({ key: "Enter", keyCode: 229 })).toBe(true);
		expect(isImeComposing({ key: "Process", nativeEvent: {} })).toBe(true);
		expect(isImeComposing({ nativeEvent: { key: "Process" } })).toBe(true);
	});
});
