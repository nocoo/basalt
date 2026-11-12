import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkGitRange, tokenizeRange } from "./git-range";

function git(cwd: string, ...args: string[]): string {
	return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function repository(): { root: string; head: string } {
	const root = mkdtempSync(join(tmpdir(), "basalt-git-range-"));
	git(root, "init", "-q");
	git(root, "config", "user.email", "self-test@example.invalid");
	git(root, "config", "user.name", "Gate Self Test");
	execFileSync("sh", ["-c", "echo one > a.txt"], { cwd: root });
	git(root, "add", ".");
	git(root, "commit", "-qm", "one");
	execFileSync("sh", ["-c", "echo two >> a.txt"], { cwd: root });
	git(root, "commit", "-qam", "two");
	return { root, head: git(root, "rev-parse", "HEAD") };
}

describe("git range resolution", () => {
	it("splits ranges into git arguments", () => {
		expect(tokenizeRange("abc..def")).toEqual(["abc..def"]);
		expect(tokenizeRange("abc --not --remotes")).toEqual(["abc", "--not", "--remotes"]);
		expect(tokenizeRange("'a b'..c")).toEqual(["a b..c"]);
		expect(tokenizeRange("   ")).toEqual([]);
	});

	it("resolves a range with commits", () => {
		const { root, head } = repository();
		try {
			const check = checkGitRange(`${head}~1..${head}`, root);
			expect(check.ok).toBe(true);
			expect(check.commits).toBe(1);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects a range git cannot resolve", () => {
		const { root } = repository();
		try {
			const check = checkGitRange("not-a-ref..HEAD", root);
			expect(check.ok).toBe(false);
			expect(check.commits).toBe(0);
			expect(check.detail).toMatch(/git rev-list/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("rejects a range that resolves to zero commits", () => {
		const { root, head } = repository();
		try {
			const check = checkGitRange(`${head}..${head}`, root);
			expect(check.ok).toBe(false);
			expect(check.detail).toMatch(/zero commits/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
