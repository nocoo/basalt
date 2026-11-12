import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { verifyCoverageReports } from "./verify-pre-commit-coverage";

type Metric = "statements" | "branches" | "functions" | "lines";

function summary(
	values: Partial<Record<Metric, number>>,
	totals?: Partial<Record<Metric, number>>,
) {
	const metrics = ["statements", "branches", "functions", "lines"] as const;
	return {
		total: Object.fromEntries(
			metrics.map((metric) => {
				const total = totals?.[metric] ?? 100;
				const pct = values[metric] ?? 100;
				return [metric, { pct, total, covered: Math.min(total, Math.round((pct / 100) * total)) }];
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

			write(root, summary({ statements: 80 }));
			expect(() => verifyCoverageReports(root)).toThrow(/statements/);

			for (const metric of ["branches", "functions", "lines"] as const) {
				write(root, summary({ [metric]: 94 }));
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

			write(root, summary({}, { statements: 0 }));
			expect(() => verifyCoverageReports(root)).toThrow(/statements total 0/);

			write(root, {
				total: {
					statements: { pct: 100 },
					branches: { pct: 100, total: 10, covered: 10 },
					functions: { pct: 100, total: 10, covered: 10 },
					lines: { pct: 100, total: 10, covered: 10 },
				},
			});
			expect(() => verifyCoverageReports(root)).toThrow(/statements total missing/);

			write(root, summary({}, { branches: 0 }));
			expect(() => verifyCoverageReports(root)).toThrow(/branches total 0/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
