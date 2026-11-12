#!/usr/bin/env bun
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { killProcessGroup, PgidRegistry, sleep } from "./process";
import { HOOK_TIMEOUT_MS, type Stage } from "./slots";

const args = process.argv.slice(2);
const argValue = (name: string) =>
	args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);

const stage = argValue("hook") as Stage | undefined;
if (stage !== "pre-commit" && stage !== "pre-push") {
	console.error("supervisor: --hook=pre-commit|pre-push is required");
	process.exit(2);
}

const override = Number.parseInt(process.env.GATE_HOOK_TIMEOUT_MS ?? "", 10);
const budgetMs = Number.isFinite(override) && override > 0 ? override : HOOK_TIMEOUT_MS[stage];

const root = resolve(import.meta.dir, "../..");
const hookPath = join(import.meta.dir, `hook-${stage}.sh`);
const registryDir = mkdtempSync(join(tmpdir(), "basalt-hook-groups-"));
const deadlineAt = Date.now() + budgetMs;

function formatMs(ms: number): string {
	return `${Math.round(ms / 1000)}s`;
}

async function readStdin(): Promise<string> {
	if (process.stdin.isTTY) return "";
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
	return Buffer.concat(chunks).toString("utf8");
}

async function terminateTree(pgid: number): Promise<void> {
	killProcessGroup(pgid, "SIGTERM");
	await sleep(1500);
	killProcessGroup(pgid, "SIGKILL");
	for (const owned of PgidRegistry.list(registryDir)) {
		killProcessGroup(owned, "SIGKILL");
	}
}

function cleanup(): void {
	rmSync(registryDir, { recursive: true, force: true });
}

let stdinTimer: ReturnType<typeof setTimeout> | undefined;
const stdinRead = await Promise.race([
	readStdin(),
	new Promise<"timeout">((resolveTimeout) => {
		stdinTimer = setTimeout(() => resolveTimeout("timeout"), Math.max(0, deadlineAt - Date.now()));
	}),
]);
if (stdinTimer) clearTimeout(stdinTimer);

if (stdinRead === "timeout") {
	console.error(`${stage}: hook lifecycle exceeded ${formatMs(budgetMs)} while reading stdin`);
	cleanup();
	process.exit(1);
}

const child = Bun.spawn(["sh", hookPath], {
	cwd: root,
	env: {
		...process.env,
		GATE_HOOK_DEADLINE_MS: String(deadlineAt),
		GATE_PGID_REGISTRY: registryDir,
	},
	stdin: "pipe",
	stdout: "inherit",
	stderr: "inherit",
	detached: true,
});

try {
	child.stdin.write(stdinRead);
	child.stdin.end();
} catch {
	// The hook body exited before reading stdin; its exit code decides the result.
}

let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
const finished = await Promise.race([
	child.exited,
	new Promise<"timeout">((resolveTimeout) => {
		deadlineTimer = setTimeout(
			() => resolveTimeout("timeout"),
			Math.max(0, deadlineAt - Date.now()),
		);
	}),
]);
if (deadlineTimer) clearTimeout(deadlineTimer);

if (finished === "timeout") {
	console.error(
		`${stage}: hook lifecycle exceeded ${formatMs(budgetMs)} — killing the process tree`,
	);
	await terminateTree(child.pid);
	await child.exited;
	cleanup();
	process.exit(1);
}

cleanup();
process.exit(finished);
