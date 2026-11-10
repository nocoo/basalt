import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { verifyCoverageReports } from "./verify-pre-commit-coverage";

describe("verifyCoverageReports", () => {
	it("requires reports and enforces four coverage floors", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-cov-verify-"));
		try {
			expect(() => verifyCoverageReports(root)).toThrow(/required/);

			mkdirSync(join(root, "coverage"), { recursive: true });
			writeFileSync(join(root, "coverage/lcov.info"), "TN:\n", "utf8");
			writeFileSync(
				join(root, "coverage/coverage-summary.json"),
				JSON.stringify({
					total: {
						statements: { pct: 80 },
						branches: { pct: 99 },
						functions: { pct: 99 },
						lines: { pct: 99 },
					},
				}),
				"utf8",
			);
			expect(() => verifyCoverageReports(root)).toThrow(/statements/);

			for (const [metric, value] of [
				["branches", 94],
				["functions", 94],
				["lines", 94],
			] as const) {
				writeFileSync(
					join(root, "coverage/coverage-summary.json"),
					JSON.stringify({
						total: {
							statements: { pct: 99 },
							branches: { pct: metric === "branches" ? value : 99 },
							functions: { pct: metric === "functions" ? value : 99 },
							lines: { pct: metric === "lines" ? value : 99 },
						},
					}),
					"utf8",
				);
				expect(() => verifyCoverageReports(root)).toThrow(new RegExp(metric));
			}

			writeFileSync(
				join(root, "coverage/coverage-summary.json"),
				JSON.stringify({
					total: {
						statements: { pct: 96 },
						branches: { pct: 96 },
						functions: { pct: 96 },
						lines: { pct: 96 },
					},
				}),
				"utf8",
			);
			expect(() => verifyCoverageReports(root)).not.toThrow();
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
