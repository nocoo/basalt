import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
	it("merges class names", () => {
		expect(cn("px-2", "py-1")).toBe("px-2 py-1");
	});

	it("drops falsy values", () => {
		expect(cn("px-2", false, null, undefined, "py-1")).toBe("px-2 py-1");
	});

	it("resolves tailwind conflicts", () => {
		expect(cn("px-2", "px-4")).toBe("px-4");
	});
});
