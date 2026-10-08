import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
	it("separates tokenized font sizes from colors and merges radius overrides", () => {
		expect(cn("text-basalt-base text-basalt-foreground", "text-basalt-sm")).toBe(
			"text-basalt-foreground text-basalt-sm",
		);
		expect(cn("rounded-basalt-md", "rounded-basalt-sm")).toBe("rounded-basalt-sm");
	});
	it("merges Basalt spacing with native Tailwind overrides", () => {
		expect(cn("h-basalt-control px-basalt-control-x py-basalt-control-y", "h-12 p-0")).toBe(
			"h-12 p-0",
		);
		expect(cn("p-basalt-space-lg", "p-basalt-card")).toBe("p-basalt-card");
		expect(cn("[&_svg]:size-basalt-icon", "[&_svg]:size-5")).toBe("[&_svg]:size-5");
		expect(cn("bg-basalt-card text-basalt-foreground", "bg-basalt-muted")).toBe(
			"text-basalt-foreground bg-basalt-muted",
		);
	});
	it("merges class names", () => {
		expect(cn("px-basalt-space-lg", "py-basalt-space-sm")).toBe(
			"px-basalt-space-lg py-basalt-space-sm",
		);
	});

	it("drops falsy values", () => {
		expect(cn("px-basalt-space-lg", false, null, undefined, "py-basalt-space-sm")).toBe(
			"px-basalt-space-lg py-basalt-space-sm",
		);
	});

	it("resolves tailwind conflicts", () => {
		expect(cn("px-basalt-space-lg", "px-basalt-space-lg")).toBe("px-basalt-space-lg");
	});
});
