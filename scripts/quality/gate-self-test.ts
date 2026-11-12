#!/usr/bin/env bun
import { spawn, spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { checkGitRange } from "./git-range";

const repoRoot = resolve(import.meta.dir, "../..");
const probesOnly = process.argv.includes("--probes-only");
const roots: string[] = [];
const results: Array<{ id: string; ok: boolean; detail: string }> = [];

function fakeToken(): string {
	return ["glpat", "1234567890abcdefghij"].join("-");
}

function tempRoot(prefix: string): string {
	const root = mkdtempSync(join(tmpdir(), prefix));
	roots.push(root);
	return root;
}

function run(
	command: string,
	args: string[],
	options: { cwd?: string; env?: NodeJS.ProcessEnv; input?: string } = {},
) {
	return spawnSync(command, args, {
		cwd: options.cwd,
		env: { ...process.env, ...options.env },
		input: options.input,
		encoding: "utf8",
	});
}

function record(id: string, ok: boolean, detail: string) {
	results.push({ id, ok, detail });
	console.log(`[gate-self-test] ${id}: ${ok ? "pass" : "FAIL"} — ${detail}`);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function spawnAsync(
	command: string,
	args: string[],
	options: { cwd?: string; env?: NodeJS.ProcessEnv; keepStdinOpen?: boolean } = {},
) {
	const child = spawn(command, args, {
		cwd: options.cwd,
		env: { ...process.env, ...options.env },
		stdio: ["pipe", "pipe", "pipe"],
	});
	let output = "";
	child.stdout?.on("data", (chunk) => {
		output += String(chunk);
	});
	child.stderr?.on("data", (chunk) => {
		output += String(chunk);
	});
	if (!options.keepStdinOpen) child.stdin.end();
	const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
		(resolveExit) => {
			child.once("exit", (code, signal) => resolveExit({ code, signal }));
		},
	);
	return { child, exited, output: () => output };
}

function expectReject(id: string, result: ReturnType<typeof run>, pattern?: RegExp) {
	const output = `${result.stdout}\n${result.stderr}`;
	const ok = result.status !== 0 && (!pattern || pattern.test(output));
	record(
		id,
		ok,
		`exit=${result.status}${pattern ? ` pattern=${pattern}` : ""}${ok ? "" : `\n${output.slice(-1200)}`}`,
	);
}

function copyGate(destination: string) {
	cpSync(join(repoRoot, "scripts/quality"), join(destination, "scripts/quality"), {
		recursive: true,
	});
	cpSync(join(repoRoot, ".gitleaks.toml"), join(destination, ".gitleaks.toml"));
	cpSync(join(repoRoot, "osv-scanner.toml"), join(destination, "osv-scanner.toml"));
}

function installFixture(root: string) {
	writeFileSync(join(root, "scripts/verify-pre-commit-coverage.ts"), "process.exit(0);\n");
	const result = run("bun", ["install"], { cwd: root });
	if (result.status !== 0) {
		throw new Error(`fixture bun install failed: ${result.stderr || result.stdout}`);
	}
	mkdirSync(join(root, "packages/basalt/node_modules"), { recursive: true });
}

function writeFixturePackage(
	root: string,
	failing: string | undefined,
	packageManager = "bun@1.4.0",
) {
	const scripts: Record<string, string> = {
		typecheck: failing === "S1" ? "exit 1" : "true",
		lint: failing === "S2" ? "exit 1" : "true",
		build: failing === "B1" ? "exit 1" : "true",
		"test:coverage": failing === "L1" ? "exit 1" : "echo 'Tests 1 passed'; echo 'coverage ok'",
		"verify-pre-commit-coverage": "true",
		"design:check": "true",
		"test:showcase:smoke": failing === "L4" ? "exit 1" : "echo 'Showcase smoke passed'",
		"pack:check": failing === "P1" ? "exit 1" : "true",
		publint: "true",
		"consumer:standalone": "true",
		"consumer:heavy": "true",
	};
	writeFileSync(
		join(root, "package.json"),
		`${JSON.stringify(
			{
				name: "gate-fixture",
				private: true,
				packageManager,
				workspaces: ["packages/*"],
				dependencies: { "@fixture/basalt": "workspace:*" },
				scripts,
			},
			null,
			"\t",
		)}\n`,
	);
	writeFileSync(
		join(root, "packages/basalt/package.json"),
		`${JSON.stringify(
			{
				name: "@fixture/basalt",
				version: "1.0.0",
				private: true,
				scripts: {
					build: "true",
					"pack:check": failing === "P1" ? "exit 1" : "true",
					publint: "true",
				},
			},
			null,
			"\t",
		)}\n`,
	);
}

function setFixtureScript(root: string, name: string, value: string) {
	const path = join(root, "package.json");
	const manifest = JSON.parse(readFileSync(path, "utf8")) as {
		scripts: Record<string, string>;
	};
	manifest.scripts[name] = value;
	writeFileSync(path, `${JSON.stringify(manifest, null, "\t")}\n`);
}

function writeExecutable(path: string, contents: string) {
	writeFileSync(path, contents);
	run("chmod", ["+x", path]);
}

function toolBin(options: {
	actionlint?: "missing" | "fail";
	osv?: "missing" | "fail";
	gitleaks?: "missing" | "fail" | "error" | "hang";
}): string {
	const bin = tempRoot("basalt-tools-");
	for (const name of ["bun", "node"]) {
		const resolved = Bun.which(name);
		if (resolved) run("ln", ["-s", resolved, join(bin, name)]);
	}
	if (options.actionlint === "fail") {
		writeExecutable(
			join(bin, "actionlint"),
			`#!/bin/sh
if [ "\${1:-}" = "--version" ]; then
  echo "1.7.12"
  exit 0
fi
exit 1
`,
		);
	}
	if (options.osv === "fail") {
		writeExecutable(
			join(bin, "osv-scanner"),
			`#!/bin/sh
if [ "\${1:-}" = "--version" ]; then
  echo "osv-scanner version: 2.5.1"
  exit 0
fi
exit 1
`,
		);
	}
	if (options.gitleaks === "fail") {
		writeExecutable(
			join(bin, "gitleaks"),
			`#!/bin/sh
if [ "\${1:-}" = "version" ]; then
  echo "8.30.1"
  exit 0
fi
exit 1
`,
		);
	}
	if (options.gitleaks === "error") {
		writeExecutable(
			join(bin, "gitleaks"),
			`#!/bin/sh
if [ "\${1:-}" = "version" ]; then
  echo "8.30.1"
  exit 0
fi
exit 2
`,
		);
	}
	if (options.gitleaks === "hang") {
		writeExecutable(
			join(bin, "gitleaks"),
			`#!/bin/sh
( sleep "\${GATE_PROBE_MARKER_DELAY:-30}"; touch "$GATE_PROBE_MARKER" ) &
sleep "\${GATE_PROBE_MARKER_DELAY:-30}"
`,
		);
	}
	return bin;
}

function gateFixtureProbes() {
	const root = tempRoot("basalt-gate-fixture-");
	mkdirSync(join(root, "packages/basalt"), { recursive: true });
	mkdirSync(join(root, ".github/workflows"), { recursive: true });
	copyGate(root);
	writeFileSync(
		join(root, ".github/workflows/ci.yml"),
		"name: fixture\non: workflow_call\njobs:\n  fixture:\n    runs-on: ubuntu-latest\n    steps:\n      - run: true\n",
	);
	writeFixturePackage(root, undefined);
	installFixture(root);

	const healthy = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1,S2"], {
		cwd: root,
	});
	record(
		"gate-healthy",
		healthy.status === 0,
		`exit=${healthy.status}${healthy.status === 0 ? "" : `\n${`${healthy.stdout}\n${healthy.stderr}`.slice(-1600)}`}`,
	);

	for (const slot of ["S1", "S2", "L1", "B1", "L4", "P1"] as const) {
		writeFixturePackage(root, slot);
		const stage = ["B1", "L1", "L4", "P1"].includes(slot) ? "pre-push" : "pre-commit";
		const result = run("bun", ["scripts/quality/gate.ts", `--stage=${stage}`, `--only=${slot}`], {
			cwd: root,
		});
		expectReject(`slot-${slot}-failure`, result);
	}

	writeFixturePackage(root, "B1");
	const l4WithoutBuild = run("bun", ["scripts/quality/gate.ts", "--stage=pre-push", "--only=L4"], {
		cwd: root,
	});
	expectReject("L4-requires-B1", l4WithoutBuild, /L4: not run after B1 failed/);

	writeFixturePackage(root, undefined);
	const s3Failure = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S3"], {
		cwd: root,
		env: {
			PATH: `${toolBin({ actionlint: "fail" })}:/usr/bin:/bin`,
			GATE_STAGED_FILES: ".github/workflows/ci.yml",
		},
	});
	expectReject("slot-S3-failure", s3Failure, /actionlint failed/);

	const missingActionlint = run(
		"bun",
		["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S3"],
		{
			cwd: root,
			env: {
				PATH: `${toolBin({ actionlint: "missing" })}:/usr/bin:/bin`,
				GATE_STAGED_FILES: ".github/workflows/ci.yml",
			},
		},
	);
	expectReject("missing-actionlint", missingActionlint, /actionlint not found/);

	const g2Failure = run("bun", ["scripts/quality/gate.ts", "--stage=pre-push", "--only=G2"], {
		cwd: root,
		env: { PATH: `${toolBin({ osv: "fail" })}:/usr/bin:/bin` },
	});
	expectReject("slot-G2-failure", g2Failure, /osv-scanner/);

	const missingOsv = run("bun", ["scripts/quality/gate.ts", "--stage=pre-push", "--only=G2"], {
		cwd: root,
		env: { PATH: `${toolBin({ osv: "missing" })}:/usr/bin:/bin` },
	});
	expectReject("missing-osv", missingOsv, /osv-scanner not found/);

	const g1Failure = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=G1"], {
		cwd: root,
		env: {
			PATH: `${toolBin({ gitleaks: "fail" })}:/usr/bin:/bin`,
			GATE_SNAPSHOT_ROOT: root,
		},
	});
	expectReject("slot-G1-failure", g1Failure, /leaks found/);

	writeFixturePackage(root, undefined);
	const timeout = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1"], {
		cwd: root,
		env: { GATE_OVERRIDE_TIMEOUT_MS: "1" },
	});
	expectReject("timeout", timeout, /timeout/);

	setFixtureScript(root, "typecheck", "sleep 0.05");
	const stageTimeout = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1"], {
		cwd: root,
		env: { GATE_OVERRIDE_STAGE_TIMEOUT_MS: "1" },
	});
	expectReject("stage-timeout", stageTimeout, /stage budget/);

	writeFixturePackage(root, undefined, "bun@1.3.0");
	const toolchainDrift = run(
		"bun",
		["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1"],
		{ cwd: root },
	);
	expectReject("toolchain-drift", toolchainDrift, /does not match packageManager/);

	writeFixturePackage(root, undefined);
	setFixtureScript(root, "test:coverage", "echo coverage only");
	const emptyCoverage = run("bun", ["scripts/quality/gate.ts", "--stage=pre-push", "--only=L1"], {
		cwd: root,
	});
	expectReject("empty-coverage", emptyCoverage, /empty run/);

	writeFileSync(join(root, "bun.lock"), "{}\n");
	const drift = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1"], {
		cwd: root,
	});
	expectReject("lockfile-drift", drift, /preflight/);
}

function gateDescendantProbe() {
	const root = tempRoot("basalt-gate-descendant-");
	mkdirSync(join(root, "packages/basalt"), { recursive: true });
	copyGate(root);
	writeFixturePackage(root, undefined);
	installFixture(root);
	const marker = join(root, "descendant.txt");
	setFixtureScript(root, "typecheck", `( sleep 5; touch ${JSON.stringify(marker)} ) & sleep 5`);
	const result = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1"], {
		cwd: root,
		env: { GATE_OVERRIDE_TIMEOUT_MS: "500" },
	});
	expectReject("gate-step-timeout", result, /timeout/);
	run("sleep", ["6"]);
	record(
		"gate-step-timeout-kills-descendants",
		!existsSync(marker),
		`descendant marker ${existsSync(marker) ? "exists" : "absent"}`,
	);
}

function g1Probes() {
	const root = tempRoot("basalt-g1-");
	run("git", ["init", "-q"], { cwd: root });
	run("git", ["config", "user.email", "self-test@example.invalid"], { cwd: root });
	run("git", ["config", "user.name", "Gate Self Test"], { cwd: root });
	cpSync(join(repoRoot, ".gitleaks.toml"), join(root, ".gitleaks.toml"));
	cpSync(join(repoRoot, "scripts/quality"), join(root, "scripts/quality"), { recursive: true });
	writeFileSync(join(root, "README.md"), "clean\n");
	run("git", ["add", "."], { cwd: root });
	run("git", ["commit", "-qm", "clean"], { cwd: root });

	const staged = tempRoot("basalt-g1-index-");
	cpSync(join(repoRoot, ".gitleaks.toml"), join(staged, ".gitleaks.toml"));
	cpSync(join(repoRoot, "scripts/quality"), join(staged, "scripts/quality"), { recursive: true });
	const clean = run("bun", ["scripts/quality/secrets.ts", "--index-snapshot"], {
		cwd: staged,
		env: { GATE_SNAPSHOT_ROOT: staged },
	});
	record("g1-clean-index", clean.status === 0, `exit=${clean.status}`);

	const indexRepo = tempRoot("basalt-g1-index-repo-");
	run("git", ["init", "-q"], { cwd: indexRepo });
	run("git", ["config", "user.email", "self-test@example.invalid"], { cwd: indexRepo });
	run("git", ["config", "user.name", "Gate Self Test"], { cwd: indexRepo });
	cpSync(join(repoRoot, ".gitleaks.toml"), join(indexRepo, ".gitleaks.toml"));
	cpSync(join(repoRoot, "scripts/quality"), join(indexRepo, "scripts/quality"), {
		recursive: true,
	});
	writeFileSync(join(indexRepo, "README.md"), "clean\n");
	run("git", ["add", "."], { cwd: indexRepo });
	run("git", ["commit", "-qm", "clean"], { cwd: indexRepo });

	writeFileSync(join(indexRepo, ".env"), `TOKEN="${fakeToken()}"\n`);
	run("git", ["add", ".env"], { cwd: indexRepo });
	rmSync(join(indexRepo, ".env"));
	const exported = tempRoot("basalt-g1-index-export-");
	const exportedResult = run("git", ["checkout-index", "--all", `--prefix=${exported}/`], {
		cwd: indexRepo,
	});
	record(
		"g1-index-export",
		exportedResult.status === 0 && existsSync(join(exported, ".env")),
		`exit=${exportedResult.status}`,
	);
	const stagedLeak = run("bun", ["scripts/quality/secrets.ts", "--index-snapshot"], {
		cwd: exported,
		env: { GATE_SNAPSHOT_ROOT: exported },
	});
	expectReject("g1-staged-index-secret", stagedLeak, /leaks found/);
	record(
		"g1-staged-secret-removed-from-worktree",
		!existsSync(join(indexRepo, ".env")),
		"the secret only lives in the exported index",
	);

	writeFileSync(join(root, ".env"), `TOKEN="${fakeToken()}"\n`);
	run("git", ["add", ".env"], { cwd: root });
	run("git", ["commit", "-qm", "fake secret for probe"], { cwd: root });
	const range = run("bun", ["scripts/quality/secrets.ts", "--range=HEAD~1..HEAD"], {
		cwd: root,
	});
	expectReject("g1-push-range-secret", range, /leaks found/);

	const scannerError = run("bun", ["scripts/quality/secrets.ts", "--range=HEAD~1..HEAD"], {
		cwd: root,
		env: { PATH: `${toolBin({ gitleaks: "error" })}:/usr/bin:/bin` },
	});
	expectReject("g1-scanner-error", scannerError, /gitleaks itself failed/);

	const invalidRange = run("bun", ["scripts/quality/secrets.ts", "--range=not-a-ref..HEAD"], {
		cwd: root,
	});
	expectReject("g1-invalid-range", invalidRange, /invalid range/);

	const head = run("git", ["rev-parse", "HEAD"], { cwd: root }).stdout.trim();
	const emptyRange = run("bun", ["scripts/quality/secrets.ts", `--range=${head}..${head}`], {
		cwd: root,
	});
	expectReject("g1-empty-range", emptyRange, /zero commits/);
}

function pushFixture(root: string) {
	run("git", ["init", "-q"], { cwd: root });
	run("git", ["config", "user.email", "self-test@example.invalid"], { cwd: root });
	run("git", ["config", "user.name", "Gate Self Test"], { cwd: root });
	mkdirSync(join(root, ".husky"), { recursive: true });
	mkdirSync(join(root, "node_modules"), { recursive: true });
	cpSync(join(repoRoot, ".husky/pre-push"), join(root, ".husky/pre-push"));
	cpSync(join(repoRoot, "scripts/quality"), join(root, "scripts/quality"), {
		recursive: true,
	});
	writeFileSync(
		join(root, "scripts/quality/gate.ts"),
		`import { appendFileSync, readFileSync } from "node:fs";
const args = process.argv.slice(2);
const range = args.find((arg) => arg.startsWith("--g1-range="))?.slice("--g1-range=".length);
if (range) appendFileSync(process.env.GATE_PROBE_RANGE_FILE ?? "/dev/null", \`\${range}\\n\`);
if (readFileSync("state.txt", "utf8").includes("bad")) {
	console.error("stub gate rejected the pushed snapshot");
	process.exit(1);
}
console.log("stub gate ok");
`,
	);
	writeFileSync(join(root, "package.json"), '{"name":"push-fixture","private":true}\n');
	writeFileSync(join(root, "state.txt"), "good\n");
	run("bun", ["scripts/quality/install-fingerprint.ts", "write"], { cwd: root });
}

function pushHookProbes() {
	const root = tempRoot("basalt-push-");
	pushFixture(root);
	run("git", ["add", "."], { cwd: root });
	run("git", ["commit", "-qm", "good"], { cwd: root });
	const good = run("git", ["rev-parse", "HEAD"], { cwd: root }).stdout.trim();

	run("git", ["checkout", "-qb", "bad"], { cwd: root });
	writeFileSync(join(root, "state.txt"), "bad\n");
	run("git", ["add", "state.txt"], { cwd: root });
	run("git", ["commit", "-qm", "bad"], { cwd: root });
	const bad = run("git", ["rev-parse", "HEAD"], { cwd: root }).stdout.trim();
	run("git", ["checkout", "-q", "-"], { cwd: root });
	writeFileSync(join(root, "state.txt"), "good\n");

	const rangeFile = join(tempRoot("basalt-push-range-"), "ranges.txt");
	const env = { GATE_PROBE_RANGE_FILE: rangeFile };

	const badPush = run(".husky/pre-push", [], {
		cwd: root,
		env,
		input: `refs/heads/bad ${bad} refs/heads/bad ${good}\n`,
	});
	expectReject("push-non-current-oid", badPush, /stub gate rejected/);

	const goodPush = run(".husky/pre-push", [], {
		cwd: root,
		env,
		input: `refs/heads/good ${good} refs/heads/good 0000000000000000000000000000000000000000\n`,
	});
	record("push-good-oid", goodPush.status === 0, `exit=${goodPush.status}`);

	const deletion = run(".husky/pre-push", [], {
		cwd: root,
		env,
		input: `(delete) 0000000000000000000000000000000000000000 refs/heads/gone ${good}\n`,
	});
	record("push-deletion-skip", deletion.status === 0, `exit=${deletion.status}`);

	const ranges = existsSync(rangeFile)
		? readFileSync(rangeFile, "utf8")
				.split("\n")
				.map((line) => line.trim())
				.filter(Boolean)
		: [];
	record("push-range-recorded", ranges.includes(`${good}..${bad}`), `ranges=${ranges.join("|")}`);
}

function newRefRangeProbes() {
	const root = tempRoot("basalt-push-remote-");
	const remote = tempRoot("basalt-push-remote-bare-");
	run("git", ["init", "-q", "--bare", remote], { cwd: remote });
	pushFixture(root);
	run("git", ["add", "."], { cwd: root });
	run("git", ["commit", "-qm", "good"], { cwd: root });
	const good = run("git", ["rev-parse", "HEAD"], { cwd: root }).stdout.trim();
	run("git", ["remote", "add", "origin", remote], { cwd: root });
	run("git", ["push", "-q", "origin", "HEAD:refs/heads/main"], { cwd: root });
	run("git", ["fetch", "-q", "origin"], { cwd: root });

	const excluded = run("git", ["rev-list", "--count", good, "--not", "--remotes"], {
		cwd: root,
	});
	record(
		"new-ref-remote-range-is-empty",
		excluded.stdout.trim() === "0",
		`rev-list --not --remotes=${excluded.stdout.trim()}`,
	);

	const rangeFile = join(tempRoot("basalt-push-range-"), "ranges.txt");
	const push = run(".husky/pre-push", [], {
		cwd: root,
		env: { GATE_PROBE_RANGE_FILE: rangeFile },
		input: `refs/heads/feature ${good} refs/heads/feature 0000000000000000000000000000000000000000\n`,
	});
	record("new-ref-push-accepted", push.status === 0, `exit=${push.status}`);
	const range = existsSync(rangeFile) ? readFileSync(rangeFile, "utf8").trim() : "";
	record("new-ref-range-is-full-history", range === good, `range=${range}`);
	const resolved = checkGitRange(range, root);
	record(
		"new-ref-range-scans-commits",
		resolved.ok && resolved.commits > 0,
		`range=${range} ${resolved.detail}`,
	);
}

function fingerprintProbes() {
	const root = tempRoot("basalt-push-fingerprint-");
	pushFixture(root);
	run("git", ["add", "."], { cwd: root });
	run("git", ["commit", "-qm", "good"], { cwd: root });
	const good = run("git", ["rev-parse", "HEAD"], { cwd: root }).stdout.trim();
	const input = `refs/heads/good ${good} refs/heads/good 0000000000000000000000000000000000000000\n`;

	const matching = run(".husky/pre-push", [], { cwd: root, input });
	const matchingOutput = `${matching.stdout}\n${matching.stderr}`;
	record(
		"push-reuses-proven-install",
		matching.status === 0 && /install fingerprint verified/.test(matchingOutput),
		`exit=${matching.status} reused=${/install fingerprint verified/.test(matchingOutput)}`,
	);
	record(
		"push-does-not-reinstall-proven-tree",
		!/frozen install/.test(matchingOutput),
		`reinstalled=${/frozen install/.test(matchingOutput)}`,
	);

	rmSync(join(root, "node_modules/.cache/basalt-install-fingerprint.json"), {
		force: true,
	});
	const missing = run(".husky/pre-push", [], { cwd: root, input });
	const missingOutput = `${missing.stdout}\n${missing.stderr}`;
	record(
		"push-missing-fingerprint-installs",
		missing.status === 0 && /frozen install in the worktree/.test(missingOutput),
		`exit=${missing.status} installed=${/frozen install in the worktree/.test(missingOutput)}`,
	);

	writeFileSync(
		join(root, "node_modules/.cache/basalt-install-fingerprint.json"),
		`${JSON.stringify({ version: 2, toolchain: "bun@0.0.0", digest: "stale" })}\n`,
	);
	const stale = run(".husky/pre-push", [], { cwd: root, input });
	const staleOutput = `${stale.stdout}\n${stale.stderr}`;
	record(
		"push-stale-fingerprint-installs",
		stale.status === 0 && /frozen install in the worktree/.test(staleOutput),
		`exit=${stale.status} installed=${/frozen install in the worktree/.test(staleOutput)}`,
	);
}

async function supervisorSignalProbes() {
	for (const [signal, code] of [
		["SIGTERM", 143],
		["SIGINT", 130],
	] as const) {
		const root = tempRoot("basalt-supervisor-signal-");
		cpSync(join(repoRoot, "scripts/quality"), join(root, "scripts/quality"), {
			recursive: true,
		});
		const marker = join(root, "descendant.txt");
		writeFileSync(
			join(root, "scripts/quality/hook-pre-push.sh"),
			`#!/usr/bin/env sh
( sleep 3; touch ${JSON.stringify(marker)} ) &
wait
`,
		);
		const { child, exited, output } = spawnAsync(
			"bun",
			["scripts/quality/supervisor.ts", "--hook=pre-push"],
			{ cwd: root, env: { GATE_HOOK_TIMEOUT_MS: "60000" } },
		);
		await sleep(1200);
		child.kill(signal);
		const result = await exited;
		record(
			`supervisor-${signal.toLowerCase()}-exit-code`,
			result.code === code,
			`code=${result.code} signal=${result.signal} output=${output().slice(-200)}`,
		);
		await sleep(4000);
		record(
			`supervisor-${signal.toLowerCase()}-kills-tree`,
			!existsSync(marker),
			`descendant marker ${existsSync(marker) ? "exists" : "absent"}`,
		);
	}
}

async function supervisorSignalBeforeChildProbe() {
	const root = tempRoot("basalt-supervisor-signal-");
	cpSync(join(repoRoot, "scripts/quality"), join(root, "scripts/quality"), { recursive: true });
	const marker = join(root, "descendant.txt");
	writeFileSync(
		join(root, "scripts/quality/hook-pre-push.sh"),
		`#!/usr/bin/env sh
touch ${JSON.stringify(marker)}
`,
	);
	const { child, exited, output } = spawnAsync(
		"bun",
		["scripts/quality/supervisor.ts", "--hook=pre-push"],
		{ cwd: root, env: { GATE_HOOK_TIMEOUT_MS: "60000" }, keepStdinOpen: true },
	);
	await sleep(800);
	child.kill("SIGTERM");
	const result = await exited;
	record(
		"supervisor-sigterm-before-child-exit-code",
		result.code === 143,
		`code=${result.code} output=${output().slice(-200)}`,
	);
	await sleep(300);
	record(
		"supervisor-sigterm-before-child-never-started",
		!existsSync(marker),
		`hook body marker ${existsSync(marker) ? "exists" : "absent"}`,
	);
}

async function hangingToolProbe() {
	const root = tempRoot("basalt-hanging-tool-");
	mkdirSync(join(root, "packages/basalt"), { recursive: true });
	copyGate(root);
	writeFixturePackage(root, undefined);
	installFixture(root);
	const marker = join(root, "tool-descendant.txt");
	const registry = join(tempRoot("basalt-hanging-tool-registry-"), "groups");
	mkdirSync(registry, { recursive: true });
	const result = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=G1"], {
		cwd: root,
		env: {
			PATH: `${toolBin({ gitleaks: "hang" })}:/usr/bin:/bin`,
			GATE_SNAPSHOT_ROOT: root,
			GATE_TOOL_TIMEOUT_MS: "800",
			GATE_PROBE_MARKER: marker,
			GATE_PROBE_MARKER_DELAY: "2",
			GATE_PGID_REGISTRY: registry,
		},
	});
	expectReject("hanging-tool-query", result, /did not answer/);
	await sleep(3000);
	record(
		"hanging-tool-kills-descendants",
		!existsSync(marker),
		`tool descendant marker ${existsSync(marker) ? "exists" : "absent"}`,
	);
	const left = readdirSync(registry);
	record(
		"hanging-tool-registers-and-cleans-group",
		left.length === 0,
		`registry entries=${left.join(",")}`,
	);
}

async function detachedServerProbe() {
	const root = tempRoot("basalt-detached-server-");
	mkdirSync(join(root, "packages/basalt"), { recursive: true });
	copyGate(root);
	writeFixturePackage(root, undefined);
	installFixture(root);
	const pidFile = join(root, "server.pid");
	writeFileSync(
		join(root, "scripts/hang-server.ts"),
		`import { writeFileSync } from "node:fs";
import { startHttpServer } from ${JSON.stringify(join(repoRoot, "scripts/consumer-http.ts"))};
const port = 20000 + (process.pid % 20000);
const started = await startHttpServer({
	cwd: process.cwd(),
	command: "node",
	args: [
		"-e",
		"require('http').createServer((q,s)=>s.end('ok')).listen(Number(process.argv[1]),'127.0.0.1')",
		String(port),
	],
	url: \`http://127.0.0.1:\${port}/\`,
	timeoutMs: 15000,
});
writeFileSync(process.env.GATE_PROBE_PID_FILE ?? "/dev/null", String(started.child.pid ?? 0));
await new Promise(() => {});
`,
	);
	setFixtureScript(root, "typecheck", "bun run scripts/hang-server.ts");
	const registry = join(tempRoot("basalt-detached-server-registry-"), "groups");
	mkdirSync(registry, { recursive: true });
	const result = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1"], {
		cwd: root,
		env: {
			GATE_OVERRIDE_TIMEOUT_MS: "3000",
			GATE_PROBE_PID_FILE: pidFile,
			GATE_PGID_REGISTRY: registry,
		},
	});
	expectReject("detached-server-step-timeout", result, /timeout/);
	const pid = existsSync(pidFile) ? Number.parseInt(readFileSync(pidFile, "utf8").trim(), 10) : 0;
	record("detached-server-started", pid > 0, `pid=${pid}`);
	let alive = false;
	try {
		process.kill(pid, 0);
		alive = true;
	} catch {
		alive = false;
	}
	record("detached-server-killed-on-step-timeout", pid > 0 && !alive, `pid=${pid} alive=${alive}`);
}

async function supervisorKillsRegisteredToolProbe() {
	const root = tempRoot("basalt-supervisor-tool-");
	mkdirSync(join(root, "packages/basalt"), { recursive: true });
	copyGate(root);
	writeFixturePackage(root, undefined);
	installFixture(root);
	const marker = join(root, "tool-descendant.txt");
	writeFileSync(
		join(root, "scripts/quality/hook-pre-push.sh"),
		`#!/usr/bin/env sh
exec bun run scripts/quality/gate.ts --stage=pre-commit --only=G1
`,
	);
	const { child, exited, output } = spawnAsync(
		"bun",
		["scripts/quality/supervisor.ts", "--hook=pre-push"],
		{
			cwd: root,
			env: {
				PATH: `${toolBin({ gitleaks: "hang" })}:${process.env.PATH ?? ""}`,
				GATE_HOOK_TIMEOUT_MS: "60000",
				GATE_TOOL_TIMEOUT_MS: "60000",
				GATE_PROBE_MARKER: marker,
				GATE_PROBE_MARKER_DELAY: "6",
				GATE_SNAPSHOT_ROOT: root,
			},
		},
	);
	await sleep(2500);
	child.kill("SIGTERM");
	const result = await exited;
	record(
		"supervisor-kills-registered-tool-exit-code",
		result.code === 143,
		`code=${result.code} output=${output().slice(-200)}`,
	);
	await sleep(5000);
	record(
		"supervisor-kills-registered-tool-tree",
		!existsSync(marker),
		`tool descendant marker ${existsSync(marker) ? "exists" : "absent"}`,
	);
}

function timeoutProbes() {
	const root = tempRoot("basalt-timeout-");
	cpSync(join(repoRoot, "scripts/quality"), join(root, "scripts/quality"), {
		recursive: true,
	});
	const marker = join(root, "descendant.txt");
	writeFileSync(
		join(root, "scripts/quality/hook-pre-push.sh"),
		`#!/usr/bin/env sh
( sleep 5; touch ${JSON.stringify(marker)} ) &
wait
`,
	);
	const started = Date.now();
	const result = run("bun", ["scripts/quality/supervisor.ts", "--hook=pre-push"], {
		cwd: root,
		env: { GATE_HOOK_TIMEOUT_MS: "1200" },
	});
	const elapsed = Date.now() - started;
	expectReject("hook-deadline", result, /killing the process tree/);
	record("hook-deadline-is-real", elapsed < 20_000, `elapsed=${elapsed}ms exit=${result.status}`);
	run("sleep", ["6"]);
	record(
		"hook-deadline-kills-descendants",
		!existsSync(marker),
		`descendant marker ${existsSync(marker) ? "exists" : "absent"}`,
	);
}

function missingToolProbe() {
	const root = tempRoot("basalt-missing-tool-");
	cpSync(join(repoRoot, ".gitleaks.toml"), join(root, ".gitleaks.toml"));
	cpSync(join(repoRoot, "scripts/quality"), join(root, "scripts/quality"), { recursive: true });
	const bin = tempRoot("basalt-missing-tool-bin-");
	const bun = Bun.which("bun");
	const node = Bun.which("node");
	if (bun) run("ln", ["-s", bun, join(bin, "bun")]);
	if (node) run("ln", ["-s", node, join(bin, "node")]);
	const result = run("bun", ["scripts/quality/secrets.ts", "--index-snapshot"], {
		cwd: root,
		env: { PATH: bin, GATE_SNAPSHOT_ROOT: root },
	});
	expectReject("missing-gitleaks", result, /scanner unavailable/);
}

function slotMapProbe() {
	const slots = readFileSync(join(repoRoot, "scripts/quality/slots.ts"), "utf8");
	const required = ["S1", "S2", "S3", "G1", "G2", "B1", "L1", "L4", "P1"];
	const missing = required.filter((id) => !slots.includes(`id: "${id}"`));
	record(
		"slot-map",
		missing.length === 0,
		missing.length ? `missing ${missing.join(",")}` : "all impl slots declared",
	);
}

function focusGuardProbe() {
	const root = tempRoot("basalt-focus-");
	cpSync(join(repoRoot, "scripts/quality"), join(root, "scripts/quality"), { recursive: true });
	mkdirSync(join(root, "src"), { recursive: true });
	writeFileSync(
		join(root, "src/focused.test.ts"),
		'import { it } from "vitest";\nit' + '.only("focused", () => {});\n',
	);
	const result = run("bun", ["scripts/quality/test-focus-guard.ts"], { cwd: root });
	expectReject("focused-test-guard", result, /focused or skipped/);
}

function z1Probes() {
	const root = tempRoot("basalt-z1-");
	cpSync(join(repoRoot, "scripts/quality"), join(root, "scripts/quality"), { recursive: true });
	const declarations = Object.fromEntries(
		["S1", "S2", "S3", "G1", "G2", "B1", "L1", "L4", "P1"].map((slot) => [
			slot,
			{ status: "impl" },
		]),
	) as Record<string, { status: string; reason?: string }>;
	declarations.L2 = {
		status: "na",
		reason: "Node tests use a mocked ASSETS binding; no workerd suite",
	};
	declarations.L3 = {
		status: "na",
		reason: "No service, protocol or storage boundary",
	};
	declarations.Z1 = { status: "impl" };
	const needs = Object.fromEntries(
		[
			"s1-types",
			"s2-lint",
			"s3-workflow",
			"g1-secrets",
			"g2-dependencies",
			"b1-build",
			"l1-unit",
			"l4-e2e",
			"p1-package",
		].map((job) => [job, { result: "success", outputs: { "tested-sha": "a".repeat(40) } }]),
	);
	needs["l2-runtime"] = { result: "skipped", outputs: {} };
	needs["l3-integration"] = { result: "skipped", outputs: {} };
	needs["consumer-next"] = {
		result: "success",
		outputs: { "tested-sha": "a".repeat(40) },
	};
	needs["hook-self-test"] = {
		result: "success",
		outputs: { "tested-sha": "a".repeat(40) },
	};
	for (const shard of [1, 2, 3, 4]) {
		needs[`unit-shard-${shard}`] = {
			result: "success",
			outputs: { "tested-sha": "a".repeat(40) },
		};
	}

	const runZ1 = (
		nextNeeds: unknown,
		nextDeclarations: unknown,
		sha = "a".repeat(40),
		outputFile = "",
	) =>
		run("python3", ["scripts/quality/z1-gate.py"], {
			cwd: root,
			env: {
				NEEDS_JSON: JSON.stringify(nextNeeds),
				SLOT_STATUS: JSON.stringify(nextDeclarations),
				EXPECTED_SHA: sha,
				GITHUB_TOKEN: "",
				GITHUB_REPOSITORY: "",
				GITHUB_RUN_ID: "",
				GITHUB_STEP_SUMMARY: "",
				GITHUB_OUTPUT: outputFile,
			},
		});

	const healthy = runZ1(needs, declarations);
	record("z1-healthy", healthy.status === 0, `exit=${healthy.status}`);
	const outputFile = join(tempRoot("basalt-z1-output-"), "output");
	const outputRun = runZ1(needs, declarations, "a".repeat(40), outputFile);
	const output = outputRun.status === 0 ? readFileSync(outputFile, "utf8").trim() : "";
	record(
		"z1-tested-sha-output",
		output === `tested-sha=${"a".repeat(40)}`,
		`exit=${outputRun.status} output=${output}`,
	);

	const implFailure = structuredClone(needs);
	implFailure["s1-types"].result = "failure";
	expectReject("z1-impl-failure", runZ1(implFailure, declarations), /declared impl/);

	const naRan = structuredClone(needs);
	naRan["l2-runtime"].result = "success";
	expectReject("z1-na-ran", runZ1(naRan, declarations), /declared na/);

	const shaMismatch = structuredClone(needs);
	shaMismatch["s2-lint"].outputs["tested-sha"] = "b".repeat(40);
	expectReject("z1-sha-mismatch", runZ1(shaMismatch, declarations), /different commits/);

	const missingSha = structuredClone(needs);
	missingSha["p1-package"].outputs["tested-sha"] = "";
	expectReject("z1-missing-sha", runZ1(missingSha, declarations), /no tested SHA/);

	const unknown = structuredClone(declarations);
	unknown.S4 = { status: "impl" };
	expectReject("z1-unknown-slot", runZ1(needs, unknown), /unknown slots/);

	const missingDeclaration = structuredClone(declarations);
	delete missingDeclaration.L1;
	expectReject(
		"z1-missing-declaration",
		runZ1(needs, missingDeclaration),
		/missing slot declarations/,
	);

	const invalidStatus = structuredClone(declarations);
	invalidStatus.S1.status = "enforced";
	expectReject("z1-invalid-status", runZ1(needs, invalidStatus), /invalid status/);

	const z1NotImpl = structuredClone(declarations);
	z1NotImpl.Z1.status = "na";
	expectReject("z1-not-impl", runZ1(needs, z1NotImpl), /Z1 must be declared impl/);

	const noReason = structuredClone(declarations);
	delete noReason.L3.reason;
	expectReject("z1-na-without-reason", runZ1(needs, noReason), /without a reason/);

	const extraFailure = structuredClone(needs);
	extraFailure["consumer-next"].result = "cancelled";
	expectReject("z1-extra-blocking-failure", runZ1(extraFailure, declarations), /blocking job/);

	const extraMissingSha = structuredClone(needs);
	extraMissingSha["hook-self-test"].outputs["tested-sha"] = "";
	expectReject("z1-extra-missing-sha", runZ1(extraMissingSha, declarations), /no tested SHA/);

	const expectedMismatch = runZ1(needs, declarations, "c".repeat(40));
	expectReject("z1-expected-sha", expectedMismatch, /this run/);
}

try {
	slotMapProbe();
	focusGuardProbe();
	g1Probes();
	pushHookProbes();
	newRefRangeProbes();
	fingerprintProbes();
	await supervisorSignalProbes();
	await supervisorSignalBeforeChildProbe();
	await supervisorKillsRegisteredToolProbe();
	timeoutProbes();
	missingToolProbe();
	z1Probes();
	if (!probesOnly) {
		gateFixtureProbes();
		gateDescendantProbe();
		await hangingToolProbe();
		await detachedServerProbe();
	}
} finally {
	for (const root of roots) {
		rmSync(root, { recursive: true, force: true });
	}
}

const failed = results.filter((result) => !result.ok);
if (failed.length > 0) {
	console.error(`gate-self-test: ${failed.length} probe(s) failed`);
	for (const result of failed) console.error(`  - ${result.id}: ${result.detail}`);
	process.exit(1);
}
console.log("gate-self-test: all probes passed");
