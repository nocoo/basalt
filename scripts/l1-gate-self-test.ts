#!/usr/bin/env bun
/**
 * L1 pre-commit gate self-test: negative probes in an isolated worktree and wall-clock
 * samples on the development checkout. Removes the worktree when finished.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
	assertCommand,
	createDetachedWorktree,
	evaluateProbe,
	formatProbeTable,
	git,
	type ProbeResult,
	readCoverageSummary,
	resetFixture,
	resolveRepoRoot,
	runPreCommitHookAsync,
	stageManifests,
	type TimingSample,
	writeFileEnsuringDir,
} from "./l1-gate-self-test.lib";

const PROBE_FAIL_TEST = "src/lib/l1-gate-self-test-fail.test.ts";
const PROBE_UNCOVERED = "src/lib/l1-gate-self-test-uncovered.ts";
const PROBE_LINT_ERROR = "src/lib/l1-gate-self-test-lint.ts";
const PROBE_LINT_WARN = "src/lib/l1-gate-self-test-warn.ts";
const PROBE_TYPE_ERROR = "src/lib/l1-gate-self-test-types.ts";
const PROBE_ONLY = "src/lib/l1-gate-self-test-only.test.ts";
const PROBE_SKIP = "src/lib/l1-gate-self-test-skip.test.ts";
const PROBE_INDEX = "src/lib/l1-gate-self-test-index.ts";

const PROBES: Array<{ id: string; expectation: "pass" | "reject" }> = [
	{ id: "missing-gitleaks", expectation: "reject" },
	{ id: "missing-bun", expectation: "reject" },
	{ id: "lint-error", expectation: "reject" },
	{ id: "lint-warning-only", expectation: "reject" },
	{ id: "type-error", expectation: "reject" },
	{ id: "index-bad-worktree-good", expectation: "reject" },
	{ id: "staged-vitest-config-without-thresholds", expectation: "reject" },
	{ id: "vitest-only", expectation: "reject" },
	{ id: "vitest-skip", expectation: "reject" },
	{ id: "ut-failure", expectation: "reject" },
	{ id: "coverage-shortfall", expectation: "reject" },
	{ id: "interrupt", expectation: "reject" },
	{ id: "healthy", expectation: "pass" },
];

function runTimingSamples(repoRoot: string): TimingSample[] {
	const hook = join(repoRoot, ".husky/pre-commit");
	spawnSync(
		"git",
		["-C", repoRoot, "add", "package.json", "bun.lock", "packages/basalt/package.json"],
		{
			encoding: "utf8",
		},
	);
	if (existsSync(join(repoRoot, "node_modules/.vitest"))) {
		rmSync(join(repoRoot, "node_modules/.vitest"), { recursive: true, force: true });
	}
	const runOnce = (label: string) => {
		const started = Date.now();
		const result = spawnSync("bash", [hook], { cwd: repoRoot, encoding: "utf8" });
		return { label, exitCode: result.status ?? 1, durationMs: Date.now() - started };
	};
	return [runOnce("pre-commit-cold-cache"), runOnce("pre-commit-warm-cache")];
}

function probeEnv(id: string): NodeJS.ProcessEnv | undefined {
	if (id === "missing-gitleaks") {
		return { PATH: "/usr/bin:/bin" };
	}
	if (id === "missing-bun") {
		return { PATH: "/usr/bin:/bin" };
	}
	return undefined;
}

async function applyProbe(id: string, fixtureRoot: string): Promise<void> {
	resetFixture(fixtureRoot);
	const vitestConfigPath = join(fixtureRoot, "vitest.config.ts");
	switch (id) {
		case "healthy": {
			writeFileEnsuringDir(
				join(fixtureRoot, "src/lib/l1-gate-self-test-marker.ts"),
				"/** L1 self-test marker */\nexport const l1GateSelfTestMarker = 1;\n",
			);
			git(fixtureRoot, ["add", "src/lib/l1-gate-self-test-marker.ts"]);
			break;
		}
		case "interrupt":
		case "missing-gitleaks":
		case "missing-bun":
			break;
		case "ut-failure": {
			writeFileEnsuringDir(
				join(fixtureRoot, PROBE_FAIL_TEST),
				`import { describe, expect, it } from "vitest";
describe("l1 gate probe", () => {
  it("fails intentionally", () => {
    expect(1).toBe(2);
  });
});
`,
			);
			git(fixtureRoot, ["add", PROBE_FAIL_TEST]);
			break;
		}
		case "coverage-shortfall": {
			writeFileEnsuringDir(
				join(fixtureRoot, PROBE_UNCOVERED),
				`export function l1GateSelfTestUncoveredBranch(flag: boolean): string {
  if (flag) return "taken";
  return "other";
}
export function l1GateSelfTestUncoveredLines(): number {
  let total = 0;
  for (let i = 0; i < 40; i += 1) total += i;
  return total;
}
`,
			);
			git(fixtureRoot, ["add", PROBE_UNCOVERED]);
			break;
		}
		case "lint-error": {
			writeFileEnsuringDir(
				join(fixtureRoot, PROBE_LINT_ERROR),
				"export const l1GateLintError = ;\n",
			);
			git(fixtureRoot, ["add", PROBE_LINT_ERROR]);
			break;
		}
		case "lint-warning-only": {
			writeFileEnsuringDir(
				join(fixtureRoot, PROBE_LINT_WARN),
				`// biome-ignore lint/complexity/useOptionalChain: probe
export const l1GateWarnValue = { a: 1 };
export const l1GateWarnExpr = l1GateWarnValue.a && l1GateWarnValue.a;
`,
			);
			git(fixtureRoot, ["add", PROBE_LINT_WARN]);
			break;
		}
		case "type-error": {
			writeFileEnsuringDir(
				join(fixtureRoot, PROBE_TYPE_ERROR),
				'export const l1GateTypeError: number = "not-a-number";\n',
			);
			git(fixtureRoot, ["add", PROBE_TYPE_ERROR]);
			break;
		}
		case "vitest-only": {
			writeFileEnsuringDir(
				join(fixtureRoot, PROBE_ONLY),
				`import { describe, expect, it } from "vitest";
describe("l1 gate only probe", () => {
  it.only("focused", () => {
    expect(true).toBe(true);
  });
});
`,
			);
			git(fixtureRoot, ["add", PROBE_ONLY]);
			break;
		}
		case "vitest-skip": {
			writeFileEnsuringDir(
				join(fixtureRoot, PROBE_SKIP),
				`import { describe, expect, it } from "vitest";
describe("l1 gate skip probe", () => {
  it.skip("skipped", () => {
    expect(true).toBe(false);
  });
});
`,
			);
			git(fixtureRoot, ["add", PROBE_SKIP]);
			break;
		}
		case "index-bad-worktree-good": {
			const path = join(fixtureRoot, PROBE_INDEX);
			writeFileEnsuringDir(path, 'export const l1GateIndexBad: number = "bad";\n');
			git(fixtureRoot, ["add", path]);
			writeFileEnsuringDir(path, "export const l1GateIndexBad: number = 1;\n");
			break;
		}
		case "staged-vitest-config-without-thresholds": {
			const original = readFileSync(vitestConfigPath, "utf8");
			const stripped = original.replace(
				/\n\t\t\tthresholds: \{[\s\S]*?\n\t\t\t\},/m,
				"\n\t\t\tthresholds: { statements: 0, branches: 0, functions: 0, lines: 0 },",
			);
			writeFileEnsuringDir(
				join(fixtureRoot, PROBE_UNCOVERED),
				`export function l1GateThresholdBypass(): number {
  let n = 0;
  for (let i = 0; i < 8; i += 1) n += i;
  return n;
}
`,
			);
			writeFileEnsuringDir(vitestConfigPath, stripped);
			git(fixtureRoot, ["add", "vitest.config.ts", PROBE_UNCOVERED]);
			break;
		}
		default:
			throw new Error(`unknown probe id: ${id}`);
	}
	stageManifests(fixtureRoot);
}

async function main(): Promise<void> {
	const repoRoot = resolveRepoRoot();
	for (const cmd of ["git", "bun", "node", "gitleaks"]) assertCommand(cmd);

	const skipTiming = process.argv.includes("--probes-only");
	const timing: TimingSample[] = skipTiming ? [] : runTimingSamples(repoRoot);
	const coverage = readCoverageSummary(repoRoot);

	const { fixtureRoot, remove } = createDetachedWorktree(repoRoot);
	const results: ProbeResult[] = [];

	try {
		for (const probe of PROBES) {
			await applyProbe(probe.id, fixtureRoot);
			const options: { env?: NodeJS.ProcessEnv; interruptAfterMs?: number } = {};
			const env = probeEnv(probe.id);
			if (env) options.env = env;
			if (probe.id === "interrupt") options.interruptAfterMs = 3_000;
			const run = await runPreCommitHookAsync(fixtureRoot, options);
			results.push(evaluateProbe(probe.id, probe.expectation, run));
			console.log(
				`[l1-gate] ${probe.id} expect=${probe.expectation} exit=${run.exitCode} signal=${run.signal ?? "-"} ms=${run.durationMs}`,
			);
		}
	} finally {
		remove();
	}

	const report = { timing, coverage, probes: results };
	writeFileEnsuringDir(
		join(repoRoot, "coverage/l1-gate-self-test-report.json"),
		`${JSON.stringify(report, null, 2)}\n`,
	);
	console.log(formatProbeTable(results));

	const failed = results.filter((row) => !row.passed);
	if (failed.length > 0) {
		console.error(`l1-gate-self-test: ${failed.length} probe(s) failed`);
		for (const row of failed) {
			console.error(`  - ${row.id}: ${row.detail ?? "unexpected outcome"}`);
		}
		process.exit(1);
	}
	console.log("l1-gate-self-test: all probes passed");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
