import { spawnSync } from "node:child_process";

export interface GitRangeCheck {
	ok: boolean;
	commits: number;
	detail: string;
}

const REV_LIST_TIMEOUT_MS = 30_000;

/**
 * Splits a revision range into Git arguments. Ranges are produced by the hooks
 * and never contain shell metacharacters, but quotes are honoured so a range
 * can carry a single argument with spaces.
 */
export function tokenizeRange(range: string): string[] {
	const tokens: string[] = [];
	let current = "";
	let quote: string | undefined;
	let started = false;
	for (const char of range) {
		if (quote) {
			if (char === quote) {
				quote = undefined;
				continue;
			}
			current += char;
			continue;
		}
		if (char === "'" || char === '"') {
			quote = char;
			started = true;
			continue;
		}
		if (/\s/.test(char)) {
			if (started) {
				tokens.push(current);
				current = "";
				started = false;
			}
			continue;
		}
		current += char;
		started = true;
	}
	if (started) tokens.push(current);
	return tokens;
}

/**
 * Resolves a revision range with Git itself. Gitleaks reports success for a
 * range it cannot resolve, so the range has to be proven before it is scanned.
 */
export function checkGitRange(range: string, cwd: string): GitRangeCheck {
	const tokens = tokenizeRange(range);
	if (tokens.length === 0) {
		return { ok: false, commits: 0, detail: "the range is empty" };
	}
	const result = spawnSync("git", ["rev-list", "--count", ...tokens], {
		cwd,
		encoding: "utf8",
		timeout: REV_LIST_TIMEOUT_MS,
	});
	if (result.error) {
		return {
			ok: false,
			commits: 0,
			detail: `git rev-list failed: ${result.error.message}`,
		};
	}
	if (result.status !== 0) {
		const stderr = (result.stderr ?? "").trim().split("\n").find(Boolean) ?? "";
		return {
			ok: false,
			commits: 0,
			detail: `git rev-list exited ${result.status}${stderr ? `: ${stderr}` : ""}`,
		};
	}
	const commits = Number.parseInt((result.stdout ?? "").trim(), 10);
	if (!Number.isFinite(commits)) {
		return { ok: false, commits: 0, detail: "git rev-list printed no commit count" };
	}
	if (commits <= 0) {
		return { ok: false, commits: 0, detail: "the range resolves to zero commits" };
	}
	return { ok: true, commits, detail: `${commits} commit${commits === 1 ? "" : "s"}` };
}
