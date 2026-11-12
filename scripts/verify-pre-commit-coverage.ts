import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const coverageFloors = {
	statements: 95,
	branches: 95,
	functions: 95,
	lines: 95,
} as const;

export function verifyCoverageReports(root: string): void {
	const summaryPath = resolve(root, "coverage/coverage-summary.json");
	const lcovPath = resolve(root, "coverage/lcov.info");

	if (!existsSync(summaryPath) || !existsSync(lcovPath)) {
		throw new Error(
			"pre-commit: coverage/lcov.info and coverage/coverage-summary.json are required",
		);
	}

	const summary = JSON.parse(readFileSync(summaryPath, "utf8")) as {
		total: Record<keyof typeof coverageFloors, { pct: number; total?: number; covered?: number }>;
	};

	const failures: string[] = [];
	for (const [metric, floor] of Object.entries(coverageFloors) as Array<
		[keyof typeof coverageFloors, number]
	>) {
		const report = summary.total?.[metric];
		const pct = report?.pct;
		const total = report?.total;
		const covered = report?.covered;
		if (typeof total !== "number" || !Number.isFinite(total) || total <= 0) {
			failures.push(`coverage ${metric} total ${total ?? "missing"} is not a positive count`);
			continue;
		}
		if (typeof covered !== "number" || !Number.isFinite(covered) || covered < 0) {
			failures.push(`coverage ${metric} covered ${covered ?? "missing"} is not a count`);
			continue;
		}
		if (covered > total) {
			failures.push(`coverage ${metric} covered ${covered} exceeds total ${total}`);
			continue;
		}
		if (typeof pct !== "number" || pct < floor) {
			failures.push(`coverage ${metric} ${pct ?? "missing"}% is below ${floor}%`);
		}
	}
	if (failures.length > 0) {
		throw new Error(`pre-commit: ${failures.join("; ")}`);
	}
}

if (import.meta.main) {
	try {
		verifyCoverageReports(process.cwd());
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
