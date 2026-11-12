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
}

function installFixture(root: string) {
	writeFileSync(join(root, "scripts/verify-pre-commit-coverage.ts"), "process.exit(0);\n");
	const result = run("bun", ["install"], { cwd: root });
	if (result.status !== 0) {
		throw new Error(`fixture bun install failed: ${result.stderr || result.stdout}`);
	}
	mkdirSync(join(root, "packages/basalt/node_modules"), { recursive: true });
}

function writeFixturePackage(root: string, failing: string | undefined) {
	const scripts: Record<string, string> = {
		typecheck: failing === "S1" ? "exit 1" : "true",
		lint: failing === "S2" ? "exit 1" : "true",
		build: failing === "B1" ? "exit 1" : "true",
		"test:coverage": failing === "L1" ? "exit 1" : "echo 'Tests 1 passed'; echo 'coverage ok'",
		"verify-pre-commit-coverage": "true",
		"design:check": "true",
		"test:showcase": failing === "L4" ? "exit 1" : "echo 'Showcase gate passed'",
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
				packageManager: "bun@1.4.0",
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

function gateFixtureProbes() {
	const root = tempRoot("basalt-gate-fixture-");
	mkdirSync(join(root, "packages/basalt"), { recursive: true });
	copyGate(root);
	writeFixturePackage(root, undefined);
	installFixture(root);

	const healthy = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1,S2,L1"], {
		cwd: root,
	});
	record(
		"gate-healthy",
		healthy.status === 0,
		`exit=${healthy.status}${healthy.status === 0 ? "" : `\n${`${healthy.stdout}\n${healthy.stderr}`.slice(-1600)}`}`,
	);

	for (const slot of ["S1", "S2", "L1", "B1", "L4", "P1"] as const) {
		writeFixturePackage(root, slot);
		const stage = ["B1", "L4", "P1"].includes(slot) ? "pre-push" : "pre-commit";
		const result = run("bun", ["scripts/quality/gate.ts", `--stage=${stage}`, `--only=${slot}`], {
			cwd: root,
		});
		expectReject(`slot-${slot}-failure`, result);
	}

	writeFixturePackage(root, undefined);
	const timeout = run("bun", ["scripts/quality/gate.ts", "--stage=pre-commit", "--only=S1"], {
		cwd: root,
		env: { GATE_OVERRIDE_TIMEOUT_MS: "1" },
	});
	expectReject("timeout", timeout, /timeout/);

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

try {
	slotMapProbe();
	g1Probes();
	pushHookProbes();
	missingToolProbe();
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
