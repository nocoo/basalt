import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { generateCatalogApi, renderCatalogApiShard } from "./catalog-api";
import { loadCatalogApiSurface } from "./package-registry";

const roots: string[] = [];
afterEach(() => {
	for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture() {
	const root = mkdtempSync(join(tmpdir(), "basalt-type-equivalence-"));
	roots.push(root);
	symlinkSync(resolve("node_modules"), join(root, "node_modules"), "dir");
	writeFileSync(
		join(root, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: {
				strict: true,
				target: "ES2022",
				module: "ESNext",
				moduleResolution: "Bundler",
				jsx: "react-jsx",
				skipLibCheck: true,
				noEmit: true,
				allowImportingTsExtensions: true,
			},
			include: ["*.ts"],
		}),
	);
	return root;
}

function compile(root: string) {
	// Check the generated text using the actual supported compiler, not the 5.9 generator API.
	const result = spawnSync(
		process.execPath,
		[resolve("node_modules/typescript/lib/tsc.js"), "-p", join(root, "tsconfig.json")],
		{ encoding: "utf8" },
	);
	expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
}

it("preserves assignability, readonly and generic scope through compound type printing", () => {
	const root = fixture();
	writeFileSync(
		join(root, "widget.ts"),
		`import type * as React from "react";
export type Renderable<T> = React.ReactNode | ((value: T) => React.ReactNode);
export type Nested<T> = { value: T; next?: Nested<T> } | undefined;
interface Base<T> {
 inherited: T; inheritedReadonly: readonly T[]; inheritedCall: (value: T) => T;
 inheritedUnion: T | ((value: T) => T);
 inheritedIntersection: ((value: T) => T) & { key: T };
}
export interface ConcreteProps extends Base<{ id: string; count: number }> {}
export interface WidgetProps<T extends { id: string } = { id: string }> extends Base<T> {
  union: (() => number) | string;
  constructed: (new () => Date) | string;
  functions: (() => number)[];
  constructors: (new () => Date)[];
  roArray: readonly (string | (() => void))[];
  tuple: readonly [label: string, item?: T, ...callbacks: ((value: T) => void)[]];
  intersection: ((value: T) => string) & { key: string };
  callback: <K extends keyof T>(key: K, ...values: readonly T[K][]) => T[K];
  renderable?: Renderable<T>;
  optionalCustom?: Nested<T>;
}
`,
	);
	const surfaces = generateCatalogApi({
		repoRoot: root,
		tsconfigPath: "tsconfig.json",
		targets: [
			{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "Widget" },
			{ slug: "widget", sourceFile: "widget.ts", propsType: "ConcreteProps", surface: "Concrete" },
		],
	}).widget;
	const surface = surfaces[0];
	expect(surface.typeParameters).toContain("T extends");
	expect(renderCatalogApiShard([surface])).toContain("typeParameters:");
	const props = surface.props
		.map((prop) => `${prop.name}${prop.required ? "" : "?"}: ${prop.type};`)
		.join("\n");
	const concreteProps = surfaces[1].props.map((prop) => `${prop.name}: ${prop.type};`).join("\n");
	writeFileSync(
		join(root, "proof.ts"),
		`import type * as React from "react";
import type { WidgetProps, ConcreteProps, Renderable, Nested } from "./widget";
interface Printed${surface.typeParameters} { ${props} }
interface ConcretePrinted { ${concreteProps} }
function concrete(a: ConcreteProps, b: ConcretePrinted) { a=b; b=a; return [a,b]; }
function bidirectional<T extends { id: string }>(original: WidgetProps<T>, printed: Printed<T>) {
 original = printed; printed = original; return [original, printed];
}
declare const p: Printed<{id: string; level: number}>;
p.renderable = "visible legend";
p.callback("level", 1, 2);
// @ts-expect-error readonly must not become mutable
const mutable: Array<string | (() => void)> = p.roArray;
// @ts-expect-error preserve readonly tuple
p.tuple[0] = "changed";
// @ts-expect-error preserve generic constraint
p.callback("missing");
// @ts-expect-error preserve indexed return/parameter types
p.callback("level", "bad");
// @ts-expect-error a callable is not a constructor
p.constructed = () => new Date();
// @ts-expect-error do not erase compound types into unknown or any
p.union = true;
`,
	);
	compile(root);
});

it("compiles real generated LineChart and Heatmap API types against their public declarations", () => {
	const root = fixture();
	const line = loadCatalogApiSurface("line")[0];
	const heatmap = loadCatalogApiSurface("heatmap-calendar").find(
		(surface) => surface.name === "HeatmapCalendar.Year",
	);
	expect(heatmap).toBeDefined();
	const typeOf = (name: string) => line.props.find((prop) => prop.name === name)?.type;
	const scale = heatmap?.props.find((prop) => prop.name === "colorScale")?.type;
	expect(scale).toBe("readonly string[]");
	const chartSource = JSON.stringify(resolve("packages/basalt/src/charts/line.tsx"));
	const heatmapSource = JSON.stringify(resolve("packages/basalt/src/charts/heatmap-calendar.tsx"));
	writeFileSync(
		join(root, "proof.ts"),
		`import type * as React from "react";
import type { LineChartProps, LineChartNumericKeys, LineChartLegendRenderer } from ${chartSource};
import type { XYPoint } from ${JSON.stringify(resolve("packages/basalt/src/charts/series.ts"))};
import type { HeatmapCalendarYearProps } from ${heatmapSource};
type PrintedData${line.typeParameters} = ${typeOf("data")};
type PrintedLegend${line.typeParameters} = ${typeOf("legend")};
function both${line.typeParameters}(a: LineChartProps<TData, K>["data"], b: PrintedData<TData, K>, c: LineChartProps<TData, K>["legend"], d: PrintedLegend<TData, K>) {
 a = b; b = a; c = d; d = c; return [a,b,c,d];
}
const textLegend: PrintedLegend = "Revenue";
type PrintedScale = ${scale};
function scales(a: NonNullable<HeatmapCalendarYearProps["colorScale"]>, b: PrintedScale) { a=b; b=a; }
const palette: PrintedScale = ["#ffffff", "#008800"] as const;
// @ts-expect-error copied readonly colorScale cannot be mutated
palette.push("#ff0000");
`,
	);
	compile(root);
	expect(readFileSync(join(root, "proof.ts"), "utf8")).not.toContain("unknown[]");
});
