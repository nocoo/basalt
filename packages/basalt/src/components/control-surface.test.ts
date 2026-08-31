import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CONTROL_SURFACE_CLASS, controlSurfaceClass } from "./control-surface";

const CONSUMERS = [
	"input.tsx",
	"input-area.tsx",
	"select.tsx",
	"input-group.tsx",
	"clipboard-text.tsx",
	"code.tsx",
	"pagination.tsx",
] as const;

function sourceOf(file: string) {
	return readFileSync(path.join("packages/basalt/src/components", file), "utf8");
}

describe("control surface", () => {
	it("is the shared class truth", () => {
		expect(CONTROL_SURFACE_CLASS).toBe(
			"rounded-basalt-md border border-basalt-border bg-basalt-secondary text-sm",
		);
		expect(controlSurfaceClass("h-9").split(/\s+/)).toEqual(
			expect.arrayContaining([...CONTROL_SURFACE_CLASS.split(/\s+/), "h-9"]),
		);
	});

	it.each(CONSUMERS)("%s imports and calls the shared helper", (file) => {
		const source = sourceOf(file);
		expect(source).toContain('from "./control-surface"');
		expect(source).toContain("controlSurfaceClass(");
	});

	it("does not restyle inline Code with the shared surface", () => {
		const source = sourceOf("code.tsx");
		const inline = source.slice(
			source.indexOf("export function Code("),
			source.indexOf("export function CodeBlock"),
		);
		const block = source.slice(
			source.indexOf("export function CodeBlock"),
			source.indexOf("export function CodeHighlighted"),
		);
		const highlighted = source.slice(source.indexOf("export function CodeHighlighted"));
		expect(inline).not.toContain("controlSurfaceClass");
		expect(inline).toContain("text-[13px]");
		expect(block).toContain("controlSurfaceClass(");
		expect(highlighted).toContain("controlSurfaceClass(");
		expect(highlighted).not.toContain("text-[13px]");
	});

	it("does not apply the shared surface to Collapsible", () => {
		const source = sourceOf("collapsible.tsx");
		expect(source).not.toContain("control-surface");
		expect(source).toContain("text-sm");
		expect(source).not.toContain("text-base");
	});
});
