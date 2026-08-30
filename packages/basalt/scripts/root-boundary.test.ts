import { describe, expect, it } from "vitest";
import { collectModuleSpecifiers, isRelativeSpecifier } from "./rewrite-declarations";
import {
	collectEsmClosure,
	type FileIo,
	resolveRelativeSpecifier,
	rootBoundaryViolations,
} from "./root-boundary";

function virtualIo(files: Record<string, string>): FileIo {
	return {
		readFile: (file) => {
			const source = files[file];
			if (source === undefined) {
				throw new Error(`missing module ${file}`);
			}
			return source;
		},
		exists: (file) => file in files,
	};
}

describe("root esm closure", () => {
	it("catches a forbidden dependency nested one hop below the root", () => {
		const files = {
			"/virtual/index.js": `export { Widget } from "./mid.js";\n`,
			"/virtual/mid.js": `import { Donut } from "./charts/donut.js";\nexport const Widget = Donut;\n`,
			"/virtual/charts/donut.js": `import { Pie } from "recharts";\nexport const Donut = Pie;\n`,
		};
		const firstLayer = collectModuleSpecifiers(files["/virtual/index.js"])
			.filter((spec) => isRelativeSpecifier(spec.value))
			.map((spec) => resolveRelativeSpecifier("/virtual/index.js", spec.value));
		expect(firstLayer).toEqual(["/virtual/mid.js"]);
		expect(firstLayer).not.toContain("/virtual/charts/donut.js");

		const closure = collectEsmClosure("/virtual/index.js", virtualIo(files));
		expect(closure.files).toEqual([
			"/virtual/index.js",
			"/virtual/mid.js",
			"/virtual/charts/donut.js",
		]);
		expect(closure.externals).toEqual(["recharts"]);
		expect(rootBoundaryViolations(closure, "/virtual")).toEqual([
			"root closure includes charts/donut.js",
			"root closure imports recharts",
		]);
	});

	it("follows nested dynamic import into a forbidden heavy module", () => {
		const files = {
			"/virtual/index.js": `export { load } from "./mid.js";\n`,
			"/virtual/mid.js": `export function load() { return import("./components/date-picker.js"); }\n`,
			"/virtual/components/date-picker.js": `import { DayPicker } from "react-day-picker";\nexport const DatePicker = DayPicker;\n`,
		};
		const closure = collectEsmClosure("/virtual/index.js", virtualIo(files));
		expect(closure.files).toContain("/virtual/components/date-picker.js");
		expect(closure.externals).toEqual(["react-day-picker"]);
		expect(rootBoundaryViolations(closure, "/virtual")).toEqual([
			"root closure includes components/date-picker.js",
			"root closure imports react-day-picker",
		]);
	});

	it("rejects a nested data-table and tanstack import", () => {
		const files = {
			"/virtual/index.js": `import "./table-shell.js";\n`,
			"/virtual/table-shell.js": `export * from "./components/data-table.js";\n`,
			"/virtual/components/data-table.js": `import { useReactTable } from "@tanstack/react-table";\nexport const DataTable = useReactTable;\n`,
		};
		const closure = collectEsmClosure("/virtual/index.js", virtualIo(files));
		expect(rootBoundaryViolations(closure, "/virtual")).toEqual([
			"root closure includes components/data-table.js",
			"root closure imports @tanstack/react-table",
		]);
	});

	it("accepts a root graph that never reaches heavy modules", () => {
		const files = {
			"/virtual/index.js": `export { Button } from "./components/button.js";\n`,
			"/virtual/components/button.js": `import { jsx } from "react/jsx-runtime";\nexport const Button = jsx;\n`,
		};
		const closure = collectEsmClosure("/virtual/index.js", virtualIo(files));
		expect(rootBoundaryViolations(closure, "/virtual")).toEqual([]);
		expect(closure.externals).toEqual(["react/jsx-runtime"]);
	});
});
