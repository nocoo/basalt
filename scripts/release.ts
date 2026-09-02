#!/usr/bin/env bun
/**
 * Usage:
 *   bun run release              — Z+1 patch
 *   bun run release -- minor     — Y+1 minor
 *   bun run release -- major     — X+1 major
 *   bun run release -- 2.0.1     — exact version
 *   bun run release -- --dry-run — preview
 *
 * Root package.json is the north star. The script copies that version to
 * packages/basalt/package.json, prepends CHANGELOG.md, commits, tags,
 * pushes, and opens a GitHub Release. npm publish stays a separate step.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

const PROJECT_ROOT = pathResolve(import.meta.dirname as string, "..");
const CHANGELOG_MD = pathResolve(PROJECT_ROOT, "CHANGELOG.md");
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const CONVENTIONAL_RE = /^(\w+)(?:\(.+?\))?(!)?:\s*(.+)$/;
const REMOVED_KEYWORDS = /\b(remove|delete|drop)\b/i;

export const VERSION_TARGETS = ["package.json", "packages/basalt/package.json"] as const;

export const BUMP_TYPES = ["patch", "minor", "major"] as const;
export type BumpType = (typeof BUMP_TYPES)[number];

export interface Commit {
	hash: string;
	subject: string;
}

export interface ChangelogSections {
	added: string[];
	changed: string[];
	fixed: string[];
	removed: string[];
}

const COMMIT_TYPE_MAP: Record<string, keyof ChangelogSections> = {
	feat: "added",
	fix: "fixed",
	refactor: "changed",
	chore: "changed",
	docs: "changed",
	test: "changed",
	perf: "changed",
	style: "changed",
	ci: "changed",
	build: "changed",
};

interface RunResult {
	code: number;
	stdout: string;
	stderr: string;
}

function run(
	cmd: string,
	args: string[],
	opts?: { cwd?: string; inherit?: boolean },
): Promise<RunResult> {
	return new Promise((resolve) => {
		const child = spawn(cmd, args, {
			cwd: opts?.cwd ?? PROJECT_ROOT,
			stdio: opts?.inherit ? "inherit" : ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		if (!opts?.inherit) {
			child.stdout?.on("data", (d: Buffer) => {
				stdout += d.toString();
			});
			child.stderr?.on("data", (d: Buffer) => {
				stderr += d.toString();
			});
		}
		child.on("close", (code) => {
			resolve({ code: code ?? 1, stdout, stderr });
		});
	});
}

async function runOrDie(cmd: string, args: string[], errorMsg: string): Promise<string> {
	const result = await run(cmd, args);
	if (result.code !== 0) {
		console.error(errorMsg);
		if (result.stderr.trim()) {
			console.error(result.stderr.trim());
		}
		process.exit(1);
	}
	return result.stdout.trim();
}

export function parseSemver(version: string): [number, number, number] {
	if (!SEMVER_RE.test(version)) {
		throw new Error(`Invalid semver: "${version}"`);
	}
	return version.split(".").map(Number) as [number, number, number];
}

export function compareSemver(a: string, b: string): number {
	const [a0, a1, a2] = parseSemver(a);
	const [b0, b1, b2] = parseSemver(b);
	if (a0 !== b0) {
		return a0 - b0;
	}
	if (a1 !== b1) {
		return a1 - b1;
	}
	return a2 - b2;
}

export function bumpVersion(current: string, bumpArg: string): string {
	if (SEMVER_RE.test(bumpArg)) {
		if (compareSemver(bumpArg, current) <= 0) {
			throw new Error(`Explicit version ${bumpArg} must be greater than current ${current}`);
		}
		return bumpArg;
	}
	if (!BUMP_TYPES.includes(bumpArg as BumpType)) {
		throw new Error(`Invalid bump type: "${bumpArg}". Use: patch | minor | major | x.y.z`);
	}
	const [major, minor, patch] = parseSemver(current);
	switch (bumpArg as BumpType) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
	}
}

export function readCurrentVersion(): string {
	const pkg = JSON.parse(readFileSync(pathResolve(PROJECT_ROOT, "package.json"), "utf-8")) as {
		version: string;
	};
	return pkg.version;
}

function updateJsonVersion(relative: string, oldVersion: string, newVersion: string): void {
	const abs = pathResolve(PROJECT_ROOT, relative);
	const content = readFileSync(abs, "utf-8");
	const pattern = `"version": "${oldVersion}"`;
	if (!content.includes(pattern)) {
		throw new Error(`${relative} does not contain ${pattern}`);
	}
	writeFileSync(abs, content.replace(pattern, `"version": "${newVersion}"`));
}

async function getLastTag(): Promise<string | undefined> {
	const result = await run("git", ["describe", "--tags", "--abbrev=0"]);
	if (result.code !== 0) {
		return undefined;
	}
	return result.stdout.trim();
}

async function getCommitsSinceTag(tag: string | undefined): Promise<Commit[]> {
	const range = tag ? `${tag}..HEAD` : "HEAD";
	const stdout = await runOrDie(
		"git",
		["log", range, "--format=%H|||%s"],
		"Failed to read git log",
	);
	if (!stdout) {
		return [];
	}
	return stdout
		.split("\n")
		.filter((line) => line.includes("|||"))
		.map((line) => {
			const sepIdx = line.indexOf("|||");
			return { hash: line.slice(0, sepIdx), subject: line.slice(sepIdx + 3) };
		})
		.filter((commit) => !commit.subject.startsWith("chore: release v"));
}

function capitalizeFirst(value: string): string {
	if (!value) {
		return value;
	}
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function classifyCommits(commits: Commit[]): ChangelogSections {
	const sections: ChangelogSections = { added: [], changed: [], fixed: [], removed: [] };
	for (const commit of commits) {
		if (commit.subject.startsWith("Merge ")) {
			continue;
		}
		const match = CONVENTIONAL_RE.exec(commit.subject);
		let description: string;
		let section: keyof ChangelogSections;
		if (match) {
			const type = (match[1] as string).toLowerCase();
			description = capitalizeFirst((match[3] as string).trim());
			section = match[2] === "!" ? "changed" : (COMMIT_TYPE_MAP[type] ?? "changed");
		} else {
			description = capitalizeFirst(commit.subject.trim());
			section = "changed";
		}
		if (REMOVED_KEYWORDS.test(commit.subject) && section === "changed") {
			section = "removed";
		}
		if (!sections[section].includes(description)) {
			sections[section].push(description);
		}
	}
	return sections;
}

export function formatChangelogSection(version: string, sections: ChangelogSections): string {
	const date = new Date().toISOString().split("T")[0];
	const lines: string[] = [`## [${version}] - ${date}`];
	const order: [keyof ChangelogSections, string][] = [
		["added", "Added"],
		["changed", "Changed"],
		["fixed", "Fixed"],
		["removed", "Removed"],
	];
	for (const [key, heading] of order) {
		const items = sections[key];
		if (items.length === 0) {
			continue;
		}
		lines.push("", `### ${heading}`);
		for (const item of items) {
			lines.push(`- ${item}`);
		}
	}
	return lines.join("\n");
}

function updateChangelog(newSection: string): void {
	const content = readFileSync(CHANGELOG_MD, "utf-8");
	const marker = "## [";
	const idx = content.indexOf(marker);
	const updated =
		idx === -1
			? `${content.trimEnd()}\n\n${newSection}\n`
			: `${content.slice(0, idx)}${newSection}\n\n${content.slice(idx)}`;
	writeFileSync(CHANGELOG_MD, updated);
}

async function main(): Promise<void> {
	const rawArgs = process.argv.slice(2).filter((arg) => arg !== "--");
	const isDryRun = rawArgs.includes("--dry-run");
	const bumpArg = rawArgs.find((arg) => arg !== "--dry-run") ?? "patch";

	const status = await runOrDie("git", ["status", "--porcelain"], "Failed to check git status");
	if (status && !isDryRun) {
		console.error("Working tree is not clean. Commit or stash changes first.");
		console.error(status);
		process.exit(1);
	}

	const ghAuthed = (await run("gh", ["auth", "status"])).code === 0;
	const currentVersion = readCurrentVersion();
	const newVersion = bumpVersion(currentVersion, bumpArg);
	const lastTag = await getLastTag();
	const tag = `v${newVersion}`;

	console.log(`${currentVersion} → ${newVersion} (${tag})`);

	if (!isDryRun) {
		for (const target of VERSION_TARGETS) {
			updateJsonVersion(target, currentVersion, newVersion);
			console.log(`updated ${target}`);
		}
	}

	const commits = await getCommitsSinceTag(lastTag);
	const changelogSection = formatChangelogSection(newVersion, classifyCommits(commits));
	console.log(changelogSection);

	if (isDryRun) {
		console.log("dry-run: no files written");
		process.exit(0);
	}

	updateChangelog(changelogSection);

	const filesToStage = [...VERSION_TARGETS, "CHANGELOG.md"];
	await runOrDie("git", ["add", ...filesToStage], "Failed to stage files");
	const commitResult = await run("git", ["commit", "-m", `chore: release v${newVersion}`], {
		inherit: true,
	});
	if (commitResult.code !== 0) {
		console.error("Commit failed");
		process.exit(1);
	}

	const pushResult = await run("git", ["push"], { inherit: true });
	if (pushResult.code !== 0) {
		console.error("git push failed");
		process.exit(1);
	}

	const tagResult = await run("git", ["tag", "-a", tag, "-m", tag]);
	if (tagResult.code !== 0) {
		console.error(`Failed to create tag ${tag}`);
		process.exit(1);
	}
	const pushTagResult = await run("git", ["push", "--tags"], { inherit: true });
	if (pushTagResult.code !== 0) {
		console.error("git push --tags failed");
		process.exit(1);
	}

	if (ghAuthed) {
		const notesPath = pathResolve("/tmp", `basalt-release-${newVersion}.md`);
		writeFileSync(notesPath, `${changelogSection}\n`);
		const ghResult = await run(
			"gh",
			["release", "create", tag, "--title", tag, "--notes-file", notesPath],
			{ inherit: true },
		);
		if (ghResult.code !== 0) {
			console.error("gh release create failed");
			process.exit(1);
		}
	}

	console.log(`release ${tag} complete`);
	console.log(
		"npm: cd packages/basalt && npm publish --access public --tag latest --ignore-scripts",
	);
}

if ((import.meta as ImportMeta & { main?: boolean }).main) {
	main().catch((error: unknown) => {
		console.error(error);
		process.exit(1);
	});
}
