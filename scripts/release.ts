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

export async function getLastTag(ctx: RunnerContext): Promise<string | undefined> {
	const result = await ctx.run("git", ["describe", "--tags", "--abbrev=0"]);
	if (result.code !== 0) {
		return undefined;
	}
	return result.stdout.trim();
}

export async function getCommitsSinceTag(
	tag: string | undefined,
	ctx: RunnerContext,
): Promise<Commit[]> {
	const range = tag ? `${tag}..HEAD` : "HEAD";
	const result = await ctx.run("git", ["log", range, "--format=%H|||%s"]);
	if (result.code !== 0) {
		throw new Error(`Failed to read git log: ${result.stderr.trim()}`);
	}
	if (!result.stdout.trim()) {
		return [];
	}
	return result.stdout
		.trim()
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
	const date = new Date().toLocaleDateString("en-CA");
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

export interface RunnerContext {
	run: (
		cmd: string,
		args: string[],
		opts?: { cwd?: string; inherit?: boolean },
	) => Promise<RunResult>;
	readJsonVersion: (relPath: string) => string;
	updateJsonVersion: (relPath: string, oldVer: string, newVer: string) => void;
	readChangelog: () => string;
	updateChangelog: (newSection: string) => void;
	writeNotesFile: (path: string, content: string) => void;
	sleep: (ms: number) => Promise<void>;
	log: (msg: string) => void;
	error: (msg: string) => void;
}

export function defaultRunnerContext(): RunnerContext {
	return {
		run,
		readJsonVersion: (relPath: string) => {
			const abs = pathResolve(PROJECT_ROOT, relPath);
			const pkg = JSON.parse(readFileSync(abs, "utf-8")) as { version: string };
			return pkg.version;
		},
		updateJsonVersion,
		readChangelog: () => readFileSync(CHANGELOG_MD, "utf-8"),
		updateChangelog,
		writeNotesFile: (path: string, content: string) => writeFileSync(path, content),
		sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
		log: (msg: string) => console.log(msg),
		error: (msg: string) => console.error(msg),
	};
}

export interface CiPollOptions {
	pollIntervalMs?: number;
	timeoutMs?: number;
}

export async function waitForCiSuccess(
	sha: string,
	ctx: RunnerContext,
	opts: CiPollOptions = {},
): Promise<void> {
	const pollIntervalMs = opts.pollIntervalMs ?? 15000;
	const timeoutMs = opts.timeoutMs ?? 20 * 60 * 1000;
	const startTime = Date.now();

	ctx.log(`Waiting for CI workflow on commit ${sha} (main push)...`);

	while (Date.now() - startTime < timeoutMs) {
		const result = await ctx.run("gh", [
			"api",
			`repos/:owner/:repo/actions/workflows/ci.yml/runs?head_sha=${sha}`,
			"--jq",
			".workflow_runs[] | {id: .id, status: .status, conclusion: .conclusion, head_branch: .head_branch, event: .event, head_sha: .head_sha, created_at: .created_at}",
		]);

		if (result.code !== 0) {
			throw new Error(`Failed to query GitHub Actions runs for ${sha}: ${result.stderr.trim()}`);
		}

		const lines = result.stdout.trim().split("\n").filter(Boolean);
		if (lines.length > 0) {
			const matchingRuns: Array<{
				id: number;
				status: string;
				conclusion: string | null;
				head_branch: string;
				event: string;
				head_sha: string;
				created_at?: string;
			}> = [];

			for (const line of lines) {
				let parsed: unknown;
				try {
					parsed = JSON.parse(line);
				} catch {
					throw new Error(`Invalid JSON from GitHub Actions API query: ${line}`);
				}

				const run = parsed as {
					id: number;
					status: string;
					conclusion: string | null;
					head_branch: string;
					event: string;
					head_sha: string;
					created_at?: string;
				};

				if (run.head_sha === sha && run.event === "push" && run.head_branch === "main") {
					matchingRuns.push(run);
				}
			}

			if (matchingRuns.length > 0) {
				// Sort by created_at descending (newest first) to match GitHub Actions workflow selection
				matchingRuns.sort((a, b) => {
					const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
					const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
					return timeB - timeA;
				});
				const latestRun = matchingRuns[0];

				if (latestRun.status === "completed") {
					if (latestRun.conclusion === "success") {
						ctx.log(`CI run #${latestRun.id} succeeded for commit ${sha}.`);
						return;
					}
					throw new Error(
						`CI run #${latestRun.id} for commit ${sha} completed with conclusion: ${latestRun.conclusion}`,
					);
				}
				ctx.log(`CI run #${latestRun.id} status is "${latestRun.status}". Waiting...`);
			}
		}

		await ctx.sleep(pollIntervalMs);
	}

	throw new Error(`Timed out waiting for CI on commit ${sha} after ${timeoutMs / 1000}s`);
}

export interface ReleaseOptions {
	bumpArg: string;
	isDryRun: boolean;
	pollOptions?: CiPollOptions;
}

export async function executeRelease(
	options: ReleaseOptions,
	ctx: RunnerContext = defaultRunnerContext(),
): Promise<void> {
	const { bumpArg, isDryRun } = options;

	const statusResult = await ctx.run("git", ["status", "--porcelain"]);
	if (statusResult.code !== 0) {
		throw new Error(`Failed to check git status: ${statusResult.stderr.trim()}`);
	}
	if (statusResult.stdout.trim() && !isDryRun) {
		throw new Error(
			`Working tree is not clean. Commit or stash changes first.\n${statusResult.stdout.trim()}`,
		);
	}

	const branchResult = await ctx.run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
	if (branchResult.code !== 0) {
		throw new Error(`Failed to check current branch: ${branchResult.stderr.trim()}`);
	}
	const currentBranch = branchResult.stdout.trim();
	if (currentBranch !== "main" && !isDryRun) {
		throw new Error(`Releases can only be run from branch "main", currently on "${currentBranch}"`);
	}

	const ghAuthResult = await ctx.run("gh", ["auth", "status"]);
	if (ghAuthResult.code !== 0 && !isDryRun) {
		throw new Error(`gh authentication required for release: ${ghAuthResult.stderr.trim()}`);
	}
	const ghAuthed = ghAuthResult.code === 0;

	const currentVersion = ctx.readJsonVersion("package.json");
	const newVersion = bumpVersion(currentVersion, bumpArg);
	const lastTag = await getLastTag(ctx);
	const tag = `v${newVersion}`;

	ctx.log(`${currentVersion} → ${newVersion} (${tag})`);

	const commits = await getCommitsSinceTag(lastTag, ctx);
	const changelogSection = formatChangelogSection(newVersion, classifyCommits(commits));
	ctx.log(changelogSection);

	if (isDryRun) {
		ctx.log("dry-run: no files written");
		return;
	}

	for (const target of VERSION_TARGETS) {
		ctx.updateJsonVersion(target, currentVersion, newVersion);
		ctx.log(`updated ${target}`);
	}

	ctx.updateChangelog(changelogSection);

	const filesToStage = [...VERSION_TARGETS, "CHANGELOG.md"];
	const addResult = await ctx.run("git", ["add", ...filesToStage]);
	if (addResult.code !== 0) {
		throw new Error(`Failed to stage files: ${addResult.stderr.trim()}`);
	}

	const commitResult = await ctx.run("git", ["commit", "-m", `chore: release v${newVersion}`], {
		inherit: true,
	});
	if (commitResult.code !== 0) {
		throw new Error("Commit failed");
	}

	const headShaResult = await ctx.run("git", ["rev-parse", "HEAD"]);
	if (headShaResult.code !== 0) {
		throw new Error(`Failed to resolve HEAD SHA: ${headShaResult.stderr.trim()}`);
	}
	const headSha = headShaResult.stdout.trim();

	const pushMainResult = await ctx.run("git", ["push", "origin", `${headSha}:refs/heads/main`], {
		inherit: true,
	});
	if (pushMainResult.code !== 0) {
		throw new Error("git push origin main failed");
	}

	await waitForCiSuccess(headSha, ctx, options.pollOptions);

	const tagResult = await ctx.run("git", ["tag", "-a", tag, headSha, "-m", tag]);
	if (tagResult.code !== 0) {
		throw new Error(`Failed to create tag ${tag}: ${tagResult.stderr.trim()}`);
	}

	const pushTagResult = await ctx.run(
		"git",
		["push", "origin", `refs/tags/${tag}:refs/tags/${tag}`],
		{ inherit: true },
	);
	if (pushTagResult.code !== 0) {
		throw new Error(`git push origin ${tag} failed: ${pushTagResult.stderr.trim()}`);
	}

	if (ghAuthed) {
		const notesPath = pathResolve("/tmp", `basalt-release-${newVersion}.md`);
		ctx.writeNotesFile(notesPath, `${changelogSection}\n`);
		const ghResult = await ctx.run(
			"gh",
			["release", "create", tag, "--title", tag, "--notes-file", notesPath],
			{ inherit: true },
		);
		if (ghResult.code !== 0) {
			throw new Error("gh release create failed");
		}
	}

	ctx.log(`release ${tag} complete`);
	ctx.log("npm: cd packages/basalt && npm publish --access public --tag latest --ignore-scripts");
}

async function main(): Promise<void> {
	const rawArgs = process.argv.slice(2).filter((arg) => arg !== "--");
	const isDryRun = rawArgs.includes("--dry-run");
	const bumpArg = rawArgs.find((arg) => arg !== "--dry-run") ?? "patch";

	await executeRelease({ bumpArg, isDryRun });
}

if ((import.meta as ImportMeta & { main?: boolean }).main) {
	main().catch((error: unknown) => {
		console.error(error);
		process.exit(1);
	});
}
