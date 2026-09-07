import { describe, expect, it } from "vitest";
import {
	bumpVersion,
	classifyCommits,
	compareSemver,
	executeRelease,
	formatChangelogSection,
	parseSemver,
	prepareChangelog,
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

describe("prepareChangelog", () => {
	const generated = "## [2.1.0] - 2026-09-07\n\n### Added\n- Generated commit summary";
	const historical = "## [2.0.3] - 2026-09-04\n\n### Fixed\n- Previous fix\n";

	it("promotes curated notes and migration links while preserving older releases", () => {
		const curated = "### Changed\n- Palette migration: [guide](guide.md#palette)";
		const result = prepareChangelog(
			`# Changelog\n\n## [Unreleased]\n\n${curated}\n\n${historical}`,
			generated,
		);
		expect(result.notes).toBe(`## [2.1.0] - 2026-09-07\n\n${curated}`);
		expect(result.content).toBe(
			`# Changelog\n\n## [Unreleased]\n\n${result.notes}\n\n${historical}`,
		);
		expect(result.notes).not.toContain("Generated commit summary");
	});

	it("uses commits for an empty Unreleased section", () => {
		const result = prepareChangelog(`# Changelog\n\n## [Unreleased]\n\n${historical}`, generated);
		expect(result.notes).toBe(generated);
		expect(result.content).toBe(`# Changelog\n\n## [Unreleased]\n\n${generated}\n\n${historical}`);
	});

	it("keeps automatic notes for changelogs without an Unreleased section", () => {
		expect(prepareChangelog(`# Changelog\n\n${historical}`, generated)).toEqual({
			notes: generated,
			content: `# Changelog\n\n${generated}\n\n${historical}`,
		});
		expect(prepareChangelog("# Changelog\n", generated).content).toBe(
			`# Changelog\n\n${generated}\n`,
		);
	});

	it("handles first-release curated notes with CRLF input", () => {
		const result = prepareChangelog(
			"# Changelog\r\n\r\n## [Unreleased]\r\n\r\nFirst release.\r\n",
			generated,
		);
		expect(result.notes).toBe("## [2.1.0] - 2026-09-07\n\nFirst release.");
		expect(result.content).toContain(`## [Unreleased]\n\n${result.notes}\n\n`);
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
	it("uses the same curated notes for the changelog, dry-run, and GitHub release", async () => {
		const curated = "### Changed\n- Read the palette migration guide before upgrading.";
		const readChangelog = () => `# Changelog\n\n## [Unreleased]\n\n${curated}\n\n## [2.0.3]\n`;
		const dry = createMockRunnerContext({ readChangelog });
		await executeRelease({ bumpArg: "minor", isDryRun: true }, dry.ctx);
		expect(dry.filesWritten).toEqual({});
		expect(dry.logs.some((line) => line.includes(curated))).toBe(true);
		const release = createMockRunnerContext({ readChangelog });
		await executeRelease({ bumpArg: "minor", isDryRun: false }, release.ctx);
		const notes = release.filesWritten["/tmp/basalt-release-2.1.0.md"];
		expect(notes).toContain(curated);
		expect(notes).not.toContain("Unreleased");
		expect(release.filesWritten["CHANGELOG.md"]).toContain(notes);
	});

	it("dry-run does not write files, commit, tag, push, or deploy", async () => {
		const { ctx, commands, filesWritten } = createMockRunnerContext();
		await executeRelease({ bumpArg: "patch", isDryRun: true }, ctx);

		expect(Object.keys(filesWritten)).toHaveLength(0);
		const writes = commands.filter(
			(c) =>
				c.cmd === "bun" ||
				(c.cmd === "git" && ["add", "commit", "push", "tag"].includes(c.args[0])) ||
				(c.cmd === "gh" && c.args[0] === "release"),
		);
		expect(writes).toHaveLength(0);
	});

	it("synchronizes the bumped workspace versions before committing the lockfile", async () => {
		const { ctx, commands, filesWritten } = createMockRunnerContext();
		const run = ctx.run;
		ctx.run = async (cmd, args, opts) => {
			if (cmd === "bun" && args[0] === "install") {
				for (const target of VERSION_TARGETS) {
					expect(filesWritten[target]).toBe("2.1.0");
				}
			}
			return run(cmd, args, opts);
		};
		await executeRelease({ bumpArg: "minor", isDryRun: false }, ctx);

		const lockIndex = commands.findIndex((c) => c.cmd === "bun" && c.args[0] === "install");
		const stageIndex = commands.findIndex((c) => c.cmd === "git" && c.args[0] === "add");
		const commitIndex = commands.findIndex((c) => c.cmd === "git" && c.args[0] === "commit");
		expect(lockIndex).toBeGreaterThan(-1);
		expect(commands[lockIndex].args).toEqual(["install", "--lockfile-only", "--ignore-scripts"]);
		expect(stageIndex).toBeGreaterThan(lockIndex);
		expect(commands[stageIndex].args).toContain("bun.lock");
		expect(commitIndex).toBeGreaterThan(stageIndex);
	});

	it("blocks commit and publication when lockfile synchronization fails", async () => {
		const { ctx, commands, filesWritten } = createMockRunnerContext();
		const run = ctx.run;
		ctx.run = async (cmd, args, opts) => {
			if (cmd === "bun" && args[0] === "install") {
				commands.push({ cmd, args });
				return { code: 1, stdout: "", stderr: "registry unavailable" };
			}
			return run(cmd, args, opts);
		};
		await expect(executeRelease({ bumpArg: "minor", isDryRun: false }, ctx)).rejects.toThrow(
			"Failed to synchronize bun.lock: registry unavailable",
		);
		expect(filesWritten["CHANGELOG.md"]).toBeUndefined();
		expect(
			commands.some((c) => c.cmd === "git" && ["add", "commit", "push", "tag"].includes(c.args[0])),
		).toBe(false);
		expect(commands.some((c) => c.cmd === "gh" && c.args[0] === "release")).toBe(false);
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
