#!/usr/bin/env bun
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const TEST_FILE = /\.(?:test|spec)\.(?:[cm]?[jt]sx?)$/;
const FOCUS_PATTERN =
	/\b(?:describe|it|test)\.(?:only|skip|todo)\s*\(|\b(?:fdescribe|fit|xdescribe|xit)\s*\(/g;
const SKIP_DIRS = new Set([".git", ".cache", "coverage", "dist", "node_modules"]);

export function findFocusedTests(root: string): string[] {
	const violations: string[] = [];
	const walk = (directory: string) => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			if (SKIP_DIRS.has(entry.name)) continue;
			const path = join(directory, entry.name);
			if (entry.isDirectory()) {
				walk(path);
				continue;
			}
			if (!entry.isFile() || !TEST_FILE.test(entry.name)) continue;
			const source = readFileSync(path, "utf8");
			const lines = source.split("\n");
			lines.forEach((line, index) => {
				FOCUS_PATTERN.lastIndex = 0;
				if (FOCUS_PATTERN.test(line)) {
					violations.push(`${relative(root, path)}:${index + 1}`);
				}
			});
		}
	};
	for (const directory of ["src", "scripts", "packages/basalt"]) {
		if (existsSync(join(root, directory))) walk(join(root, directory));
	}
	return violations;
}

if (import.meta.main) {
	const violations = findFocusedTests(process.cwd());
	if (violations.length > 0) {
		console.error(`L1: focused or skipped tests are not allowed:\n${violations.join("\n")}`);
		process.exit(1);
	}
	console.log("L1: no focused or skipped tests");
}
