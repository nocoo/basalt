import { type SpawnSyncReturns, spawn, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export type ProbeExpectation = "pass" | "reject";

export type ProbeResult = {
	id: string;
	expectation: ProbeExpectation;
	exitCode: number | null;
	signal: NodeJS.Signals | null;
	durationMs: number;
	passed: boolean;
	detail?: string;
};

export type TimingSample = {
	label: string;
	exitCode: number;
	durationMs: number;
};

export function resolveRepoRoot(): string {
	return resolve(import.meta.dirname, "..");
}

export function assertCommand(command: string): void {
	const found = spawnSync("bash", ["-lc", `command -v ${command}`], { encoding: "utf8" });
	if (found.status !== 0) {
		throw new Error(`l1-gate-self-test: required executable missing: ${command}`);
	}
}

export function linkNodeModules(repoRoot: string, fixtureRoot: string): void {
	const targets = [
		{ src: join(repoRoot, "node_modules"), dst: join(fixtureRoot, "node_modules") },
		{
			src: join(repoRoot, "packages/basalt/node_modules"),
			dst: join(fixtureRoot, "packages/basalt/node_modules"),
		},
	];
	for (const { src, dst } of targets) {
		if (!existsSync(src)) {
			throw new Error(`l1-gate-self-test: expected installed modules at ${src}`);
		}
		if (existsSync(dst)) {
			rmSync(dst, { recursive: true, force: true });
		}
		mkdirSync(resolve(dst, ".."), { recursive: true });
		symlinkSync(src, dst);
	}
}

export function createDetachedWorktree(repoRoot: string): {
	fixtureRoot: string;
	remove: () => void;
} {
	const parent = mkdtempSync(join(tmpdir(), "basalt-l1-gate-"));
	const fixtureRoot = join(parent, "fixture");
	const add = spawnSync(
		"git",
		["-C", repoRoot, "worktree", "add", "--detach", fixtureRoot, "HEAD"],
		{
			encoding: "utf8",
		},
	);
	if (add.status !== 0) {
		rmSync(parent, { recursive: true, force: true });
		throw new Error(`worktree add failed: ${add.stderr || add.stdout}`);
	}
	spawnSync("git", ["-C", fixtureRoot, "config", "core.hooksPath", ".husky"], { encoding: "utf8" });
	linkNodeModules(repoRoot, fixtureRoot);
	const remove = () => {
		spawnSync("git", ["-C", repoRoot, "worktree", "remove", "--force", fixtureRoot], {
			encoding: "utf8",
		});
		rmSync(parent, { recursive: true, force: true });
	};
	return { fixtureRoot, remove };
}

export function git(fixtureRoot: string, args: string[]): SpawnSyncReturns<string> {
	return spawnSync("git", ["-C", fixtureRoot, ...args], { encoding: "utf8" });
}

export function resetFixture(fixtureRoot: string): void {
	const hard = git(fixtureRoot, ["reset", "--hard", "HEAD"]);
	if (hard.status !== 0) {
		throw new Error(`git reset failed: ${hard.stderr}`);
	}
	const clean = git(fixtureRoot, ["clean", "-fd"]);
	if (clean.status !== 0) {
		throw new Error(`git clean failed: ${clean.stderr}`);
	}
}

export function stageManifests(fixtureRoot: string): void {
	const stage = git(fixtureRoot, [
		"add",
		"package.json",
		"bun.lock",
		"packages/basalt/package.json",
	]);
	if (stage.status !== 0) {
		throw new Error(`git add manifests failed: ${stage.stderr}`);
	}
}

export async function runPreCommitHookAsync(
	fixtureRoot: string,
	options?: { env?: NodeJS.ProcessEnv; interruptAfterMs?: number },
): Promise<{ exitCode: number | null; signal: NodeJS.Signals | null; durationMs: number }> {
	const hookPath = join(fixtureRoot, ".husky/pre-commit");
	const env = { ...process.env, ...options?.env };
	const started = Date.now();
	return new Promise((resolvePromise) => {
		const child = spawn("bash", [hookPath], {
			cwd: fixtureRoot,
			env,
			stdio: "ignore",
		});
		let timer: NodeJS.Timeout | undefined;
		if (options?.interruptAfterMs != null) {
			timer = setTimeout(() => child.kill("SIGINT"), options.interruptAfterMs);
		}
		child.on("close", (code, signal) => {
			if (timer) clearTimeout(timer);
			resolvePromise({ exitCode: code, signal, durationMs: Date.now() - started });
		});
	});
}

export function evaluateProbe(
	id: string,
	expectation: ProbeExpectation,
	run: { exitCode: number | null; signal: NodeJS.Signals | null; durationMs: number },
): ProbeResult {
	let passed = false;
	let detail: string | undefined;
	if (expectation === "pass") {
		passed = run.exitCode === 0;
		if (!passed) detail = `expected exit 0, got ${run.exitCode} signal=${run.signal ?? "none"}`;
	} else {
		passed = run.exitCode !== 0 || run.signal != null;
		if (!passed) detail = "expected rejection (nonzero exit or signal), hook succeeded";
	}
	return {
		id,
		expectation,
		exitCode: run.exitCode,
		signal: run.signal,
		durationMs: run.durationMs,
		passed,
		detail,
	};
}

export function writeFileEnsuringDir(path: string, contents: string): void {
	mkdirSync(resolve(path, ".."), { recursive: true });
	writeFileSync(path, contents, "utf8");
}

export function readCoverageSummary(repoRoot: string): {
	statements: number;
	branches: number;
	functions: number;
	lines: number;
} | null {
	const summaryPath = join(repoRoot, "coverage/coverage-summary.json");
	if (!existsSync(summaryPath)) return null;
	const raw = JSON.parse(readFileSync(summaryPath, "utf8")) as {
		total: {
			statements: { pct: number };
			branches: { pct: number };
			functions: { pct: number };
			lines: { pct: number };
		};
	};
	return {
		statements: raw.total.statements.pct,
		branches: raw.total.branches.pct,
		functions: raw.total.functions.pct,
		lines: raw.total.lines.pct,
	};
}

export function formatProbeTable(results: ProbeResult[]): string {
	const lines = ["id\texpect\texit\tsignal\tms\tok\tdetail"];
	for (const row of results) {
		lines.push(
			[
				row.id,
				row.expectation,
				row.exitCode ?? "null",
				row.signal ?? "-",
				row.durationMs,
				row.passed ? "yes" : "NO",
				row.detail ?? "",
			].join("\t"),
		);
	}
	return lines.join("\n");
}
