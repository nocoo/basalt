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

function shard(root: string, name: string, coverage: unknown): string {
	const directory = join(root, name);
	mkdirSync(directory, { recursive: true });
	writeFileSync(join(directory, "coverage-final.json"), JSON.stringify(coverage));
	return directory;
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

	it("rejects a valid shard combined with empty shards", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-coverage-merge-"));
		try {
			const path = join(root, "src/example.ts");
			const valid = shard(root, "valid", { [path]: fileCoverage(path) });
			const empty = shard(root, "empty", {});
			expect(() =>
				mergeCoverage([valid, empty, empty, empty], join(root, "coverage"), root),
			).toThrow(/contains no files/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects shards whose counters are empty or all zero", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-coverage-merge-"));
		try {
			const path = join(root, "src/example.ts");
			const empty = fileCoverage(path);
			empty.s = {};
			empty.f = {};
			empty.b = {};
			empty.statementMap = {};
			empty.fnMap = {};
			empty.branchMap = {};
			const emptyCounters = shard(root, "empty-counters", { [path]: empty });
			expect(() => mergeCoverage([emptyCounters], join(root, "coverage"), root)).toThrow(
				/measured no statements/,
			);

			const zero = fileCoverage(path);
			zero.s = { 0: 0, 1: 0 };
			zero.f = { 0: 0, 1: 0, 2: 0 };
			zero.b = { 0: [0, 0] };
			const zeroCounters = shard(root, "zero-counters", { [path]: zero });
			expect(() => mergeCoverage([zeroCounters], join(root, "coverage"), root)).toThrow(
				/measured no covered statement/,
			);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects a shard with a short branch hit array in any position", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-coverage-merge-"));
		try {
			const path = join(root, "src/example.ts");
			const corrupt = fileCoverage(path);
			corrupt.b = { 0: [1] };
			const valid = shard(root, "valid", { [path]: fileCoverage(path) });
			const broken = shard(root, "broken", { [path]: corrupt });

			expect(() => mergeCoverage([valid, broken], join(root, "coverage"), root)).toThrow(
				/branch 0 has 1 hits but 2 branch locations/,
			);
			expect(() => mergeCoverage([broken, valid], join(root, "coverage"), root)).toThrow(
				/branch 0 has 1 hits but 2 branch locations/,
			);
			expect(() => mergeCoverage([broken, broken], join(root, "coverage"), root)).toThrow(
				/branch 0 has 1 hits but 2 branch locations/,
			);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects a shard whose counters do not match its maps", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-coverage-merge-"));
		try {
			const path = join(root, "src/example.ts");
			const broken = fileCoverage(path);
			broken.s = { 0: 1 };
			const directory = shard(root, "broken", { [path]: broken });
			expect(() => mergeCoverage([directory], join(root, "coverage"), root)).toThrow(
				/statementMap entries but 1 counters/,
			);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects a shard with a missing coverage file", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-coverage-merge-"));
		try {
			const missing = join(root, "missing");
			mkdirSync(missing, { recursive: true });
			expect(() => mergeCoverage([missing], join(root, "coverage"), root)).toThrow(
				/missing coverage-final.json/,
			);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("merges valid shards into one denominator", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-coverage-merge-"));
		try {
			const path = join(root, "src/example.ts");
			const other = join(root, "src/other.ts");
			const first = shard(root, "first", { [path]: fileCoverage(path) });
			const second = shard(root, "second", {
				[other]: { ...fileCoverage(other), path: other },
			});
			const total = mergeCoverage([first, second], join(root, "coverage"), root);
			expect(total.statements.total).toBe(4);
			expect(total.functions.total).toBe(6);
			expect(total.branches.total).toBe(4);
			expect(total.lines.total).toBe(4);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
