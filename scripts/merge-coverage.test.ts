import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { mergeCoverage } from "./merge-coverage";

function location(line: number, column: number | null = null) {
	return {
		start: { line, column },
		end: { line, column },
	};
}

function fileCoverage(path: string) {
	return {
		path,
		statementMap: {
			0: location(1),
			1: location(2),
		},
		fnMap: {
			0: { name: "outer", decl: location(1), loc: location(1), line: 1 },
			1: { name: "(anonymous_1)", decl: location(2, 1), loc: location(2, 2), line: 2 },
			2: { name: "(anonymous_2)", decl: location(2, 2), loc: location(2, 2), line: 2 },
		},
		branchMap: {
			0: { type: "if", loc: location(2), locations: [location(2), location(2)] },
		},
		s: { 0: 1, 1: 1 },
		f: { 0: 1, 1: 1, 2: 1 },
		b: { 0: [1, 1] },
	};
}

describe("mergeCoverage", () => {
	it("preserves same-location functions and adds shard hits", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-coverage-merge-"));
		try {
			const first = join(root, "first");
			const second = join(root, "second");
			mkdirSync(first);
			mkdirSync(second);
			const path = join(root, "src/example.ts");
			writeFileSync(
				join(first, "coverage-final.json"),
				JSON.stringify({ [path]: fileCoverage(path) }),
			);
			const other = fileCoverage(path);
			other.s[0] = 0;
			other.f[2] = 0;
			writeFileSync(join(second, "coverage-final.json"), JSON.stringify({ [path]: other }));

			const total = mergeCoverage([first, second], join(root, "coverage"), root);
			const summary = JSON.parse(
				readFileSync(join(root, "coverage/coverage-summary.json"), "utf8"),
			) as { total: typeof total };
			const lcov = readFileSync(join(root, "coverage/lcov.info"), "utf8");

			expect(total.functions.total).toBe(3);
			expect(total.functions.covered).toBe(3);
			expect(total.statements.covered).toBe(2);
			expect(total.branches.covered).toBe(2);
			expect(summary.total.functions.total).toBe(3);
			expect(lcov).toContain("FNF:3");
			expect(lcov).toContain("FN:2,(anonymous_1)");
			expect(lcov).toContain("FN:2,(anonymous_2)");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
