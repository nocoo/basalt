import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CONTROL_SURFACE_CLASS, controlSurfaceClass } from "./control-surface";

const pkgRoot = "packages/basalt";
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
	return readFileSync(path.join(pkgRoot, "src/components", file), "utf8");
}

describe("control surface", () => {
	it("is the shared class truth", () => {
		expect(CONTROL_SURFACE_CLASS).toBe(
			"rounded-basalt-md border border-basalt-border bg-basalt-control text-sm",
		);
		expect(controlSurfaceClass("h-9").split(/\s+/)).toEqual(
			expect.arrayContaining([...CONTROL_SURFACE_CLASS.split(/\s+/), "h-9"]),
		);
	});

	it("lives in utils, outside the components export wildcard", () => {
		expect(existsSync(path.join(pkgRoot, "src/utils/control-surface.ts"))).toBe(true);
		expect(existsSync(path.join(pkgRoot, "src/components/control-surface.ts"))).toBe(false);
		const pkg = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8")) as {
			exports: Record<string, unknown>;
		};
		expect(Object.keys(pkg.exports).some((key) => key.includes("utils"))).toBe(false);
	});

	it.each(CONSUMERS)("%s imports and calls the shared helper", (file) => {
		const source = sourceOf(file);
		expect(source).toContain('from "../utils/control-surface"');
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

	it.skipIf(!existsSync(path.join(pkgRoot, "dist/utils/control-surface.js")))(
		"is not published on components/* and is blocked by package exports",
		() => {
			expect(existsSync(path.join(pkgRoot, "dist/components/control-surface.js"))).toBe(false);
			expect(existsSync(path.join(pkgRoot, "dist/components/control-surface.d.ts"))).toBe(false);
			expect(existsSync(path.join(pkgRoot, "dist/utils/control-surface.js"))).toBe(true);
			expect(existsSync(path.join(pkgRoot, "dist/utils/control-surface.d.ts"))).toBe(true);

			const result = spawnSync(
				"node",
				[
					"--input-type=module",
					"-e",
					`const specs = [
  "@nocoo/basalt/components/control-surface",
  "@nocoo/basalt/utils/control-surface",
];
for (const spec of specs) {
  try {
    await import(spec);
    console.error("imported " + spec);
    process.exit(2);
  } catch (error) {
    console.log(spec + " " + (error.code ?? error.message));
  }
}
`,
				],
				{ cwd: pkgRoot, encoding: "utf8" },
			);
			expect(result.status, result.stderr).toBe(0);
			expect(result.stdout).toContain("ERR_MODULE_NOT_FOUND");
			expect(result.stdout).toContain("ERR_PACKAGE_PATH_NOT_EXPORTED");
			expect(result.stdout).toContain("@nocoo/basalt/components/control-surface");
			expect(result.stdout).toContain("@nocoo/basalt/utils/control-surface");
			expect(result.stdout).not.toContain("imported ");
		},
	);
});
