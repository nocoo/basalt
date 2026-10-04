import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
	it("merges Basalt spacing with native Tailwind overrides", () => {
		expect(cn("h-basalt-control px-basalt-control-x py-basalt-control-y", "h-12 p-0")).toBe(
			"h-12 p-0",
		);
		expect(cn("p-4", "p-basalt-card")).toBe("p-basalt-card");
		expect(cn("[&_svg]:size-basalt-icon", "[&_svg]:size-5")).toBe("[&_svg]:size-5");
		expect(cn("bg-basalt-card text-basalt-foreground", "bg-basalt-muted")).toBe(
			"text-basalt-foreground bg-basalt-muted",
		);
	});
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
