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
		total: Record<keyof typeof coverageFloors, { pct: number }>;
	};

	const failures: string[] = [];
	for (const [metric, floor] of Object.entries(coverageFloors) as Array<
		[keyof typeof coverageFloors, number]
	>) {
		const pct = summary.total[metric]?.pct;
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
