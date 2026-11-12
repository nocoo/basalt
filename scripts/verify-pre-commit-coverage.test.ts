import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { coveragePercent, verifyCoverageReports } from "./verify-pre-commit-coverage";

type Metric = "statements" | "branches" | "functions" | "lines";

const METRICS: Metric[] = ["statements", "branches", "functions", "lines"];

function report(covered: number, total: number) {
	return { pct: coveragePercent(covered, total), total, covered };
}

function summary(
	values: Partial<Record<Metric, { covered: number; total: number }>>,
	overrides: Partial<Record<Metric, unknown>> = {},
) {
	return {
		total: Object.fromEntries(
			METRICS.map((metric) => {
				if (metric in overrides) return [metric, overrides[metric]];
				const value = values[metric] ?? { covered: 100, total: 100 };
				return [metric, report(value.covered, value.total)];
			}),
		),
	};
}

function write(root: string, value: unknown): void {
	writeFileSync(join(root, "coverage/coverage-summary.json"), JSON.stringify(value), "utf8");
}

describe("verifyCoverageReports", () => {
	it("requires reports and enforces four coverage floors", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-cov-verify-"));
		try {
			expect(() => verifyCoverageReports(root)).toThrow(/required/);

			mkdirSync(join(root, "coverage"), { recursive: true });
			writeFileSync(join(root, "coverage/lcov.info"), "TN:\n", "utf8");

			write(root, summary({ statements: { covered: 80, total: 100 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/statements/);

			for (const metric of ["branches", "functions", "lines"] as const) {
				write(root, summary({ [metric]: { covered: 94, total: 100 } }));
				expect(() => verifyCoverageReports(root)).toThrow(new RegExp(metric));
			}

			write(root, summary({}));
			expect(() => verifyCoverageReports(root)).not.toThrow();
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects a zero or missing denominator", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-cov-verify-"));
		try {
			mkdirSync(join(root, "coverage"), { recursive: true });
			writeFileSync(join(root, "coverage/lcov.info"), "TN:\n", "utf8");

			write(root, summary({}, { statements: { pct: 100, total: 0, covered: 0 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/statements total 0/);

			write(root, summary({}, { statements: { pct: 100 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/statements total missing/);

			write(root, summary({}, { branches: { pct: 100, total: 10, covered: 0 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/branches/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("derives the percentage from the counts", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-cov-verify-"));
		try {
			mkdirSync(join(root, "coverage"), { recursive: true });
			writeFileSync(join(root, "coverage/lcov.info"), "TN:\n", "utf8");

			write(root, summary({}, { statements: { pct: 100, total: 100, covered: 0 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/statements/);

			write(root, summary({}, { statements: { pct: 100, total: 100, covered: 96 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/statements reports 100%/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects counts that are out of range", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-cov-verify-"));
		try {
			mkdirSync(join(root, "coverage"), { recursive: true });
			writeFileSync(join(root, "coverage/lcov.info"), "TN:\n", "utf8");

			write(root, summary({}, { statements: { pct: 100, total: 10, covered: 20 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/exceeds total/);

			write(root, summary({}, { statements: { pct: 100, total: 10, covered: -1 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/not a count/);

			write(root, summary({}, { statements: { pct: Number.NaN, total: 10, covered: 10 } }));
			expect(() => verifyCoverageReports(root)).toThrow(/not a number/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("accepts the real project totals", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-cov-verify-"));
		try {
			mkdirSync(join(root, "coverage"), { recursive: true });
			writeFileSync(join(root, "coverage/lcov.info"), "TN:\n", "utf8");

			write(
				root,
				summary({
					statements: { covered: 4603, total: 4692 },
					branches: { covered: 4498, total: 4655 },
					functions: { covered: 1211, total: 1222 },
					lines: { covered: 4309, total: 4382 },
				}),
			);
			expect(() => verifyCoverageReports(root)).not.toThrow();
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
