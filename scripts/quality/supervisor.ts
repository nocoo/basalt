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

let child: ReturnType<typeof Bun.spawn> | undefined;
let settled = false;
let exitCode = 1;
let cleaning: Promise<void> | undefined;

function ownedGroups(): number[] {
	const groups = new Set(PgidRegistry.list(registryDir));
	if (child) groups.add(child.pid);
	return [...groups];
}

async function terminateOwnedGroups(): Promise<void> {
	const groups = ownedGroups();
	for (const pgid of groups) killProcessGroup(pgid, "SIGTERM");
	if (child) await Promise.race([child.exited, sleep(1500)]);
	for (const pgid of new Set([...groups, ...ownedGroups()])) killProcessGroup(pgid, "SIGKILL");
	if (child) await child.exited;
}

/**
 * The single exit path for interrupts, the deadline, a normal child exit and an
 * unexpected failure: terminate every owned process group, drop the registry
 * and leave with the recorded code.
 */
async function finish(code: number, message?: string): Promise<void> {
	if (!settled) {
		settled = true;
		exitCode = code;
		if (message) console.error(message);
		cleaning = (async () => {
			await terminateOwnedGroups();
			rmSync(registryDir, { recursive: true, force: true });
		})();
	}
	await cleaning;
	process.exit(exitCode);
}

const SIGNAL_CODES: Array<[NodeJS.Signals, number]> = [
	["SIGINT", 130],
	["SIGTERM", 143],
	["SIGHUP", 129],
];
for (const [signal, code] of SIGNAL_CODES) {
	process.on(signal, () => {
		void finish(code, `${stage}: ${signal} received — killing the process tree`);
	});
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
	await finish(1, `${stage}: hook lifecycle exceeded ${formatMs(budgetMs)} while reading stdin`);
}

child = Bun.spawn(["sh", hookPath], {
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
	await finish(
		1,
		`${stage}: hook lifecycle exceeded ${formatMs(budgetMs)} — killing the process tree`,
	);
}

await finish(finished);
