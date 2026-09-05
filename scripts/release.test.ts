import { describe, expect, it } from "vitest";
import {
	bumpVersion,
	classifyCommits,
	compareSemver,
	executeRelease,
	formatChangelogSection,
	parseSemver,
	type RunnerContext,
	VERSION_TARGETS,
} from "./release";

describe("parseSemver", () => {
	it("parses valid semver", () => {
		expect(parseSemver("1.2.3")).toEqual([1, 2, 3]);
	});

	it("throws on invalid semver", () => {
		expect(() => parseSemver("v1.2.3")).toThrow('Invalid semver: "v1.2.3"');
	});
});

describe("compareSemver", () => {
	it("orders versions", () => {
		expect(compareSemver("2.0.1", "2.0.0")).toBeGreaterThan(0);
		expect(compareSemver("2.0.0", "2.0.0")).toBe(0);
	});
});

describe("bumpVersion", () => {
	it("bumps patch, minor, and major", () => {
		expect(bumpVersion("2.0.0", "patch")).toBe("2.0.1");
		expect(bumpVersion("2.0.1", "minor")).toBe("2.1.0");
		expect(bumpVersion("2.1.0", "major")).toBe("3.0.0");
	});

	it("accepts an explicit greater version", () => {
		expect(bumpVersion("2.0.0", "2.0.1")).toBe("2.0.1");
	});

	it("rejects a version that is not greater", () => {
		expect(() => bumpVersion("2.0.0", "2.0.0")).toThrow("must be greater than current");
	});
});

describe("classifyCommits", () => {
	it("maps conventional types onto Keep a Changelog sections", () => {
		const sections = classifyCommits([
			{ hash: "a", subject: "feat: share theme palette with header picker" },
			{ hash: "b", subject: "fix: stop ci catalog test timeouts" },
			{ hash: "c", subject: "docs: add app chrome guide for agents" },
		]);
		expect(sections.added).toEqual(["Share theme palette with header picker"]);
		expect(sections.fixed).toEqual(["Stop ci catalog test timeouts"]);
		expect(sections.changed).toEqual(["Add app chrome guide for agents"]);
	});
});

describe("formatChangelogSection", () => {
	it("emits Keep a Changelog headings", () => {
		const body = formatChangelogSection("2.0.1", {
			added: ["Release script"],
			changed: [],
			fixed: ["Sidebar version"],
			removed: [],
		});
		expect(body).toContain("## [2.0.1] - ");
		expect(body).toContain("### Added");
		expect(body).toContain("- Release script");
		expect(body).toContain("### Fixed");
	});
});

describe("VERSION_TARGETS", () => {
	it("keeps the package copies next to the root north star", () => {
		expect(VERSION_TARGETS).toEqual(["package.json", "packages/basalt/package.json"]);
	});
});

function createMockRunnerContext(overrides: Partial<RunnerContext> = {}): {
	ctx: RunnerContext;
	commands: Array<{ cmd: string; args: string[] }>;
	logs: string[];
	errors: string[];
	filesWritten: Record<string, string>;
} {
	const commands: Array<{ cmd: string; args: string[] }> = [];
	const logs: string[] = [];
	const errors: string[] = [];
	const filesWritten: Record<string, string> = {};

	const defaultVersions: Record<string, string> = {
		"package.json": "2.0.3",
		"packages/basalt/package.json": "2.0.3",
	};

	const ctx: RunnerContext = {
		run: async (cmd: string, args: string[]) => {
			commands.push({ cmd, args });
			if (cmd === "git" && args[0] === "status") {
				return { code: 0, stdout: "", stderr: "" };
			}
			if (cmd === "git" && args[0] === "rev-parse" && args[1] === "--abbrev-ref") {
				return { code: 0, stdout: "main\n", stderr: "" };
			}
			if (cmd === "git" && args[0] === "rev-parse" && args[1] === "HEAD") {
				return { code: 0, stdout: "commit123\n", stderr: "" };
			}
			if (cmd === "git" && args[0] === "describe") {
				return { code: 0, stdout: "v2.0.3\n", stderr: "" };
			}
			if (cmd === "git" && args[0] === "log") {
				return {
					code: 0,
					stdout: "commit123|||feat: new gate\ncommit122|||fix: gate timeout\n",
					stderr: "",
				};
			}
			if (cmd === "git" && args[0] === "add") {
				return { code: 0, stdout: "", stderr: "" };
			}
			if (cmd === "git" && args[0] === "commit") {
				return { code: 0, stdout: "", stderr: "" };
			}
			if (cmd === "git" && args[0] === "push") {
				return { code: 0, stdout: "", stderr: "" };
			}
			if (cmd === "git" && args[0] === "tag") {
				return { code: 0, stdout: "", stderr: "" };
			}
			if (cmd === "gh" && args[0] === "auth") {
				return { code: 0, stdout: "", stderr: "" };
			}
			if (cmd === "gh" && args[0] === "release") {
				return { code: 0, stdout: "", stderr: "" };
			}
			if (cmd === "gh" && args[0] === "api") {
				return {
					code: 0,
					stdout: JSON.stringify({
						id: 100,
						status: "completed",
						conclusion: "success",
						head_branch: "main",
						event: "push",
						head_sha: "commit123",
					}),
					stderr: "",
				};
			}
			return { code: 0, stdout: "", stderr: "" };
		},
		readJsonVersion: (rel: string) => defaultVersions[rel] ?? "2.0.3",
		updateJsonVersion: (rel: string, _old: string, newV: string) => {
			filesWritten[rel] = newV;
		},
		readChangelog: () => "## [2.0.3] - 2026-09-01\n",
		updateChangelog: (newSection: string) => {
			filesWritten["CHANGELOG.md"] = newSection;
		},
		writeNotesFile: (p: string, c: string) => {
			filesWritten[p] = c;
		},
		sleep: async () => {},
		log: (msg: string) => logs.push(msg),
		error: (msg: string) => errors.push(msg),
		...overrides,
	};

	return { ctx, commands, logs, errors, filesWritten };
}

describe("executeRelease gates and failure paths", () => {
	it("dry-run does not write files, commit, tag, push, or deploy", async () => {
		const { ctx, commands, filesWritten } = createMockRunnerContext();
		await executeRelease({ bumpArg: "patch", isDryRun: true }, ctx);

		expect(Object.keys(filesWritten)).toHaveLength(0);
		const writes = commands.filter(
			(c) =>
				(c.cmd === "git" && ["add", "commit", "push", "tag"].includes(c.args[0])) ||
				(c.cmd === "gh" && c.args[0] === "release"),
		);
		expect(writes).toHaveLength(0);
	});

	it("fails fast if git working tree is dirty", async () => {
		const { ctx } = createMockRunnerContext({
			run: async (cmd, args) => {
				if (cmd === "git" && args[0] === "status") {
					return { code: 0, stdout: " M some-file.ts\n", stderr: "" };
				}
				return { code: 0, stdout: "", stderr: "" };
			},
		});

		await expect(executeRelease({ bumpArg: "patch", isDryRun: false }, ctx)).rejects.toThrow(
			/Working tree is not clean/,
		);
	});

	it("fails fast if not on main branch", async () => {
		const { ctx } = createMockRunnerContext({
			run: async (cmd, args) => {
				if (cmd === "git" && args[0] === "status") {
					return { code: 0, stdout: "", stderr: "" };
				}
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "--abbrev-ref") {
					return { code: 0, stdout: "work/some-feature\n", stderr: "" };
				}
				return { code: 0, stdout: "", stderr: "" };
			},
		});

		await expect(executeRelease({ bumpArg: "patch", isDryRun: false }, ctx)).rejects.toThrow(
			/Releases can only be run from branch "main"/,
		);
	});

	it("pushes origin main explicitly, waits for CI, and pushes only the exact tag (no --tags)", async () => {
		const { ctx, commands } = createMockRunnerContext();
		await executeRelease({ bumpArg: "patch", isDryRun: false }, ctx);

		const pushes = commands.filter((c) => c.cmd === "git" && c.args[0] === "push");
		expect(pushes).toHaveLength(2);
		expect(pushes[0].args).toEqual(["push", "origin", "commit123:refs/heads/main"]);
		expect(pushes[1].args).toEqual(["push", "origin", "refs/tags/v2.0.4:refs/tags/v2.0.4"]);

		// Verify --tags is strictly forbidden on git push
		for (const cmd of pushes) {
			expect(cmd.args).not.toContain("--tags");
		}
	});

	it("binds tag to the verified headSha even if HEAD moves during CI wait", async () => {
		let headQueryCount = 0;
		const { ctx, commands } = createMockRunnerContext({
			run: async (cmd, args) => {
				commands.push({ cmd, args });
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "HEAD") {
					headQueryCount++;
					return {
						code: 0,
						stdout: headQueryCount === 1 ? "commit123\n" : "commit999\n",
						stderr: "",
					};
				}
				if (cmd === "git" && args[0] === "status") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "--abbrev-ref")
					return { code: 0, stdout: "main\n", stderr: "" };
				if (cmd === "git" && args[0] === "describe")
					return { code: 0, stdout: "v2.0.3\n", stderr: "" };
				if (cmd === "git" && args[0] === "log")
					return { code: 0, stdout: "commit123|||feat: gate\n", stderr: "" };
				if (cmd === "git" && args[0] === "add") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "commit") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "push") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "tag") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "gh" && args[0] === "auth") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "gh" && args[0] === "release") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "gh" && args[0] === "api") {
					return {
						code: 0,
						stdout: JSON.stringify({
							id: 100,
							status: "completed",
							conclusion: "success",
							head_branch: "main",
							event: "push",
							head_sha: "commit123",
						}),
						stderr: "",
					};
				}
				return { code: 0, stdout: "", stderr: "" };
			},
		});

		await executeRelease({ bumpArg: "patch", isDryRun: false }, ctx);

		const tagCmd = commands.find((c) => c.cmd === "git" && c.args[0] === "tag");
		expect(tagCmd).toBeDefined();
		// tag args: ["tag", "-a", "v2.0.4", "commit123", "-m", "v2.0.4"]
		expect(tagCmd?.args).toEqual(["tag", "-a", "v2.0.4", "commit123", "-m", "v2.0.4"]);
	});

	it("fails fast before modifying files or committing if gh is not authenticated", async () => {
		const { ctx, commands, filesWritten } = createMockRunnerContext({
			run: async (cmd, args) => {
				if (cmd === "gh" && args[0] === "auth") {
					return { code: 1, stdout: "", stderr: "not logged in" };
				}
				if (cmd === "git" && args[0] === "status") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "--abbrev-ref")
					return { code: 0, stdout: "main\n", stderr: "" };
				return { code: 0, stdout: "", stderr: "" };
			},
		});

		await expect(executeRelease({ bumpArg: "patch", isDryRun: false }, ctx)).rejects.toThrow(
			/gh authentication required/,
		);
		expect(Object.keys(filesWritten)).toHaveLength(0);
		expect(commands.filter((c) => c.cmd === "git" && c.args[0] === "commit")).toHaveLength(0);
	});

	it("rejects CI run with wrong branch or event and ignores them", async () => {
		const { ctx } = createMockRunnerContext({
			run: async (cmd, args) => {
				if (cmd === "gh" && args[0] === "api") {
					// Return runs on other branches or events, but none matching main push
					return {
						code: 0,
						stdout: [
							JSON.stringify({
								id: 1,
								status: "completed",
								conclusion: "success",
								head_branch: "feature",
								event: "push",
								head_sha: "commit123",
							}),
							JSON.stringify({
								id: 2,
								status: "completed",
								conclusion: "success",
								head_branch: "main",
								event: "pull_request",
								head_sha: "commit123",
							}),
						].join("\n"),
						stderr: "",
					};
				}
				if (cmd === "git" && args[0] === "status") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "--abbrev-ref")
					return { code: 0, stdout: "main\n", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "HEAD")
					return { code: 0, stdout: "commit123\n", stderr: "" };
				if (cmd === "git" && args[0] === "describe")
					return { code: 0, stdout: "v2.0.3\n", stderr: "" };
				if (cmd === "git" && args[0] === "log")
					return { code: 0, stdout: "commit123|||feat: gate\n", stderr: "" };
				return { code: 0, stdout: "", stderr: "" };
			},
		});

		await expect(
			executeRelease(
				{ bumpArg: "patch", isDryRun: false, pollOptions: { pollIntervalMs: 1, timeoutMs: 5 } },
				ctx,
			),
		).rejects.toThrow(/Timed out waiting for CI/);
	});

	it("does not let an older successful CI run mask a newer pending run regardless of order in output", async () => {
		const { ctx } = createMockRunnerContext({
			run: async (cmd, args) => {
				if (cmd === "gh" && args[0] === "api") {
					// Deliberately unsorted in stdout: older success first, newer pending second
					return {
						code: 0,
						stdout: [
							JSON.stringify({
								id: 100,
								status: "completed",
								conclusion: "success",
								head_branch: "main",
								event: "push",
								head_sha: "commit123",
								created_at: "2026-09-06T06:00:00Z",
							}),
							JSON.stringify({
								id: 200,
								status: "in_progress",
								conclusion: null,
								head_branch: "main",
								event: "push",
								head_sha: "commit123",
								created_at: "2026-09-06T06:30:00Z",
							}),
						].join("\n"),
						stderr: "",
					};
				}
				if (cmd === "git" && args[0] === "status") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "--abbrev-ref")
					return { code: 0, stdout: "main\n", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "HEAD")
					return { code: 0, stdout: "commit123\n", stderr: "" };
				if (cmd === "git" && args[0] === "describe")
					return { code: 0, stdout: "v2.0.3\n", stderr: "" };
				if (cmd === "git" && args[0] === "log")
					return { code: 0, stdout: "commit123|||feat: gate\n", stderr: "" };
				return { code: 0, stdout: "", stderr: "" };
			},
		});

		// Since newest by created_at is in_progress, it should wait and eventually time out, NOT succeed because run 100 was listed first
		await expect(
			executeRelease(
				{ bumpArg: "patch", isDryRun: false, pollOptions: { pollIntervalMs: 1, timeoutMs: 5 } },
				ctx,
			),
		).rejects.toThrow(/Timed out waiting for CI/);
	});

	it("aborts release if CI fails for the exact commit", async () => {
		const { ctx } = createMockRunnerContext({
			run: async (cmd, args) => {
				if (cmd === "gh" && args[0] === "api") {
					return {
						code: 0,
						stdout: JSON.stringify({
							id: 999,
							status: "completed",
							conclusion: "failure",
							head_branch: "main",
							event: "push",
							head_sha: "commit123",
						}),
						stderr: "",
					};
				}
				if (cmd === "git" && args[0] === "status") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "--abbrev-ref")
					return { code: 0, stdout: "main\n", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "HEAD")
					return { code: 0, stdout: "commit123\n", stderr: "" };
				if (cmd === "git" && args[0] === "describe")
					return { code: 0, stdout: "v2.0.3\n", stderr: "" };
				if (cmd === "git" && args[0] === "log")
					return { code: 0, stdout: "commit123|||feat: gate\n", stderr: "" };
				return { code: 0, stdout: "", stderr: "" };
			},
		});

		await expect(executeRelease({ bumpArg: "patch", isDryRun: false }, ctx)).rejects.toThrow(
			/conclusion: failure/,
		);
	});

	it("aborts release if CI times out", async () => {
		const { ctx } = createMockRunnerContext({
			run: async (cmd, args) => {
				if (cmd === "gh" && args[0] === "api") {
					return {
						code: 0,
						stdout: JSON.stringify({
							id: 999,
							status: "in_progress",
							conclusion: null,
							head_branch: "main",
							event: "push",
							head_sha: "commit123",
						}),
						stderr: "",
					};
				}
				if (cmd === "git" && args[0] === "status") return { code: 0, stdout: "", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "--abbrev-ref")
					return { code: 0, stdout: "main\n", stderr: "" };
				if (cmd === "git" && args[0] === "rev-parse" && args[1] === "HEAD")
					return { code: 0, stdout: "commit123\n", stderr: "" };
				if (cmd === "git" && args[0] === "describe")
					return { code: 0, stdout: "v2.0.3\n", stderr: "" };
				if (cmd === "git" && args[0] === "log")
					return { code: 0, stdout: "commit123|||feat: gate\n", stderr: "" };
				return { code: 0, stdout: "", stderr: "" };
			},
		});

		await expect(
			executeRelease(
				{ bumpArg: "patch", isDryRun: false, pollOptions: { pollIntervalMs: 1, timeoutMs: 5 } },
				ctx,
			),
		).rejects.toThrow(/Timed out waiting for CI/);
	});
});
