#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

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
	gitleaks?: "missing" | "fail" | "error";
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
	writeFileSync(join(staged, ".env"), `TOKEN="${fakeToken()}"\n`);
	const leaked = run("bun", ["scripts/quality/secrets.ts", "--index-snapshot"], {
		cwd: staged,
		env: { GATE_SNAPSHOT_ROOT: staged },
	});
	expectReject("g1-staged-secret", leaked, /leaks found/);

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
}

function pushHookProbes() {
	const root = tempRoot("basalt-push-");
	run("git", ["init", "-q"], { cwd: root });
	run("git", ["config", "user.email", "self-test@example.invalid"], { cwd: root });
	run("git", ["config", "user.name", "Gate Self Test"], { cwd: root });
	mkdirSync(join(root, ".husky"), { recursive: true });
	mkdirSync(join(root, "node_modules"), { recursive: true });
	cpSync(join(repoRoot, ".husky/pre-push"), join(root, ".husky/pre-push"));
	writeFileSync(join(root, "package.json"), '{"name":"push-fixture","private":true}\n');
	writeFileSync(join(root, "bun.lock"), "{}\n");
	writeFileSync(join(root, "state.txt"), "good\n");
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

	const stubDir = tempRoot("basalt-push-bin-");
	writeFileSync(
		join(stubDir, "bun"),
		`#!/bin/sh
if grep -q '^bad$' state.txt; then
  echo "stub bun rejected the pushed snapshot" >&2
  exit 1
fi
exit 0
`,
	);
	run("chmod", ["+x", join(stubDir, "bun")]);
	const path = `${stubDir}:${process.env.PATH ?? ""}`;

	const badPush = run(".husky/pre-push", [], {
		cwd: root,
		env: { PATH: path },
		input: `refs/heads/bad ${bad} refs/heads/bad ${good}\n`,
	});
	expectReject("push-non-current-oid", badPush, /stub bun rejected/);

	const goodPush = run(".husky/pre-push", [], {
		cwd: root,
		env: { PATH: path },
		input: `refs/heads/good ${good} refs/heads/good 0000000000000000000000000000000000000000\n`,
	});
	record("push-good-oid", goodPush.status === 0, `exit=${goodPush.status}`);

	const deletion = run(".husky/pre-push", [], {
		cwd: root,
		env: { PATH: path },
		input: `(delete) 0000000000000000000000000000000000000000 refs/heads/gone ${good}\n`,
	});
	record("push-deletion-skip", deletion.status === 0, `exit=${deletion.status}`);
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
	missingToolProbe();
	z1Probes();
	if (!probesOnly) gateFixtureProbes();
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
