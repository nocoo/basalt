#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

interface Position {
	line: number;
	column: number | null;
}

interface Location {
	start: Position;
	end: Position;
}

interface FunctionEntry {
	name: string;
	decl: Location;
	loc: Location;
	line: number;
}

interface BranchEntry {
	loc: Location;
	type: string;
	locations: Location[];
}

interface FileCoverage {
	path: string;
	statementMap: Record<string, Location>;
	fnMap: Record<string, FunctionEntry>;
	branchMap: Record<string, BranchEntry>;
	s: Record<string, number>;
	f: Record<string, number>;
	b: Record<string, number[]>;
}

interface Metric {
	total: number;
	covered: number;
	skipped: number;
	pct: number;
}

interface FileSummary {
	lines: Metric;
	statements: Metric;
	functions: Metric;
	branches: Metric;
	branchesTrue: Metric;
}

function metric(covered: number, total: number): Metric {
	return {
		total,
		covered,
		skipped: 0,
		pct: total > 0 ? Math.floor((covered / total) * 10_000) / 100 : 100,
	};
}

function locationKey(location: Location): string {
	return `${location.start.line}:${location.start.column ?? ""}:${location.end.line}:${location.end.column ?? ""}`;
}

function functionKey(fn: FunctionEntry): string {
	return `${fn.name}\0${locationKey(fn.loc)}`;
}

function branchKey(branch: BranchEntry): string {
	return `${branch.type}\0${branch.locations.map(locationKey).join("|")}`;
}

function addHits(left: number[], right: number[]): number[] {
	return left.map((hit, index) => hit + (right[index] ?? 0));
}

function mergeFile(path: string, files: FileCoverage[]): FileCoverage {
	const statementMap = new Map<string, { location: Location; hits: number }>();
	const fnMap = new Map<string, { entry: FunctionEntry; hits: number }>();
	const branchMap = new Map<string, { entry: BranchEntry; hits: number[] }>();

	for (const file of files) {
		for (const [index, location] of Object.entries(file.statementMap)) {
			const key = locationKey(location);
			const current = statementMap.get(key);
			statementMap.set(key, {
				location,
				hits: (current?.hits ?? 0) + (file.s[index] ?? 0),
			});
		}
		for (const [index, entry] of Object.entries(file.fnMap)) {
			const key = functionKey(entry);
			const current = fnMap.get(key);
			fnMap.set(key, {
				entry,
				hits: (current?.hits ?? 0) + (file.f[index] ?? 0),
			});
		}
		for (const [index, entry] of Object.entries(file.branchMap)) {
			const key = branchKey(entry);
			const current = branchMap.get(key);
			branchMap.set(key, {
				entry,
				hits: current ? addHits(current.hits, file.b[index] ?? []) : [...(file.b[index] ?? [])],
			});
		}
	}

	const statementEntries = [...statementMap.values()];
	const functionEntries = [...fnMap.values()];
	const branchEntries = [...branchMap.values()];
	return {
		path,
		statementMap: Object.fromEntries(
			statementEntries.map(({ location }, index) => [String(index), location]),
		),
		s: Object.fromEntries(statementEntries.map(({ hits }, index) => [String(index), hits])),
		fnMap: Object.fromEntries(functionEntries.map(({ entry }, index) => [String(index), entry])),
		f: Object.fromEntries(functionEntries.map(({ hits }, index) => [String(index), hits])),
		branchMap: Object.fromEntries(branchEntries.map(({ entry }, index) => [String(index), entry])),
		b: Object.fromEntries(branchEntries.map(({ hits }, index) => [String(index), hits])),
	};
}

function summarize(file: FileCoverage): FileSummary {
	const lineHits = new Map<number, number>();
	for (const [index, location] of Object.entries(file.statementMap)) {
		const line = location.start.line;
		lineHits.set(line, Math.max(lineHits.get(line) ?? 0, file.s[index] ?? 0));
	}
	const statementHits = Object.values(file.s);
	const functionHits = Object.values(file.f);
	const branchHits = Object.values(file.b).flat();
	return {
		lines: metric([...lineHits.values()].filter((hit) => hit > 0).length, lineHits.size),
		statements: metric(statementHits.filter((hit) => hit > 0).length, statementHits.length),
		functions: metric(functionHits.filter((hit) => hit > 0).length, functionHits.length),
		branches: metric(branchHits.filter((hit) => hit > 0).length, branchHits.length),
		branchesTrue: metric(0, 0),
	};
}

function mergeSummary(files: FileCoverage[], root: string): Record<string, FileSummary> {
	const total: FileSummary = {
		lines: metric(0, 0),
		statements: metric(0, 0),
		functions: metric(0, 0),
		branches: metric(0, 0),
		branchesTrue: metric(0, 0),
	};
	const summary: Record<string, FileSummary> = {};
	for (const file of files) {
		const fileSummary = summarize(file);
		const key = relative(root, file.path);
		summary[key] = fileSummary;
		for (const metricName of Object.keys(total) as Array<keyof FileSummary>) {
			total[metricName].total += fileSummary[metricName].total;
			total[metricName].covered += fileSummary[metricName].covered;
			total[metricName].pct = metric(total[metricName].covered, total[metricName].total).pct;
		}
	}
	return { total, ...summary };
}

function writeLcov(files: FileCoverage[], root: string): string {
	const lines: string[] = [];
	for (const file of files) {
		const summary = summarize(file);
		lines.push("TN:", `SF:${relative(root, file.path)}`);
		for (const fn of Object.values(file.fnMap)) {
			lines.push(`FN:${fn.loc.start.line},${fn.name}`);
		}
		lines.push(`FNF:${summary.functions.total}`, `FNH:${summary.functions.covered}`);
		for (const [index, fn] of Object.entries(file.fnMap)) {
			lines.push(`FNDA:${file.f[index] ?? 0},${fn.name}`);
		}
		const lineHits = new Map<number, number>();
		for (const [index, location] of Object.entries(file.statementMap)) {
			const line = location.start.line;
			lineHits.set(line, Math.max(lineHits.get(line) ?? 0, file.s[index] ?? 0));
		}
		for (const [line, hits] of [...lineHits].sort(([left], [right]) => left - right)) {
			lines.push(`DA:${line},${hits}`);
		}
		lines.push(`LF:${summary.lines.total}`, `LH:${summary.lines.covered}`);
		for (const [index, branch] of Object.entries(file.branchMap)) {
			const line = branch.loc.start.line;
			for (const [branchIndex, hit] of (file.b[index] ?? []).entries()) {
				lines.push(`BRDA:${line},${index},${branchIndex},${hit}`);
			}
		}
		lines.push(`BRF:${summary.branches.total}`, `BRH:${summary.branches.covered}`, "end_of_record");
	}
	return `${lines.join("\n")}\n`;
}

export function mergeCoverage(inputs: string[], output: string, root = process.cwd()): FileSummary {
	const files = new Map<string, FileCoverage[]>();
	for (const input of inputs) {
		const path = resolve(input, "coverage-final.json");
		if (!existsSync(path)) {
			throw new Error(`missing coverage-final.json in ${input}`);
		}
		const coverage = JSON.parse(readFileSync(path, "utf8")) as Record<string, FileCoverage>;
		for (const [filePath, file] of Object.entries(coverage)) {
			const current = files.get(filePath);
			if (current) current.push(file);
			else files.set(filePath, [file]);
		}
	}
	if (files.size === 0) {
		throw new Error("coverage inputs contained no files");
	}

	const merged = [...files.entries()].map(([path, coverage]) => mergeFile(path, coverage));
	const summary = mergeSummary(merged, root);
	const outputDir = resolve(output);
	mkdirSync(outputDir, { recursive: true });
	writeFileSync(
		resolve(outputDir, "coverage-final.json"),
		`${JSON.stringify(Object.fromEntries(merged.map((file) => [file.path, file])))}\n`,
	);
	writeFileSync(resolve(outputDir, "coverage-summary.json"), `${JSON.stringify(summary)}\n`);
	writeFileSync(resolve(outputDir, "lcov.info"), writeLcov(merged, root));
	return summary.total;
}

if (import.meta.main) {
	const args = process.argv.slice(2);
	const value = (name: string) =>
		args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
	const inputs = value("input")
		?.split(",")
		.map((input) => input.trim())
		.filter(Boolean);
	if (!inputs?.length) {
		console.error("merge-coverage: --input=<dir>[,<dir>...] is required");
		process.exit(2);
	}
	try {
		const total = mergeCoverage(inputs, value("output") ?? "coverage");
		console.log(
			`Coverage merged: statements ${total.statements.pct}% (${total.statements.covered}/${total.statements.total}), branches ${total.branches.pct}% (${total.branches.covered}/${total.branches.total}), functions ${total.functions.pct}% (${total.functions.covered}/${total.functions.total}), lines ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`,
		);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
