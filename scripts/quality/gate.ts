#!/usr/bin/env bun
import { resolve } from "node:path";
import { preflight } from "./deps";
import { killProcessGroup, PgidRegistry } from "./process";
import {
	NOT_APPLICABLE,
	type SlotDefinition,
	STAGE_TIMEOUT_MS,
	type Stage,
	slotsForStage,
} from "./slots";
import { checkTool } from "./tools";

const args = process.argv.slice(2);
const argValue = (name: string) =>
	args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);

const stage = argValue("stage") as Stage | undefined;
const only = argValue("only");
const g1Range = argValue("g1-range");

if (stage !== "pre-commit" && stage !== "pre-push") {
	console.error("gate: --stage=pre-commit|pre-push is required");
	process.exit(2);
}

const root = resolve(import.meta.dir, "../..");
const gitRoot = process.env.GATE_GIT_ROOT ?? root;
const startedAt = performance.now();
const stageBudgetMs = STAGE_TIMEOUT_MS[stage];
const registry = new PgidRegistry();
const overrideTimeoutMs = Number.parseInt(process.env.GATE_OVERRIDE_TIMEOUT_MS ?? "", 10);
const overrideStageTimeoutMs = Number.parseInt(
	process.env.GATE_OVERRIDE_STAGE_TIMEOUT_MS ?? "",
	10,
);
const hookDeadlineMs = Number.parseInt(process.env.GATE_HOOK_DEADLINE_MS ?? "", 10);
const hookRemainingMs = Number.isFinite(hookDeadlineMs)
	? hookDeadlineMs - Date.now()
	: Number.POSITIVE_INFINITY;
const effectiveStageBudgetMs = Math.min(
	stageBudgetMs,
	hookRemainingMs,
	Number.isFinite(overrideStageTimeoutMs) && overrideStageTimeoutMs > 0
		? overrideStageTimeoutMs
		: Number.POSITIVE_INFINITY,
);

for (const signal of ["SIGTERM", "SIGINT"] as const) {
	process.on(signal, () => {
		for (const pgid of PgidRegistry.list()) killProcessGroup(pgid, "SIGKILL");
		process.exit(signal === "SIGTERM" ? 143 : 130);
	});
}

const requested = slotsForStage(stage).filter((slot) => !only || only.split(",").includes(slot.id));
const selectedIds = new Set(requested.map((slot) => slot.id));
if (stage === "pre-push" && ["L1", "L4", "P1"].some((id) => selectedIds.has(id))) {
	selectedIds.add("B1");
}
const selected = slotsForStage(stage).filter((slot) => selectedIds.has(slot.id));

if (selected.some((slot) => slot.id === "G1") && stage === "pre-push" && !g1Range) {
	console.error("gate: pre-push G1 requires --g1-range=<remote>..<local>");
	process.exit(2);
}

const stagedPaths = (process.env.GATE_STAGED_FILES ?? "")
	.split("\n")
	.map((line) => line.trim())
	.filter(Boolean);

type Outcome = "pass" | "fail" | "timeout" | "skip";

interface StepResult {
	label: string;
	command: string;
	outcome: Outcome;
	ms: number;
	note: string;
}

interface SlotResult {
	slot: SlotDefinition;
	outcome: Outcome;
	ms: number;
	steps: StepResult[];
	note: string;
}

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*[A-Za-z]`, "g");

async function runStep(
	command: string,
	timeoutMs: number,
	expect: { pattern: RegExp; label: string; min: number } | undefined,
	label: string,
): Promise<StepResult> {
	const started = performance.now();
	const effectiveTimeout = Math.max(
		1,
		Number.isFinite(overrideTimeoutMs) && overrideTimeoutMs > 0
			? Math.min(timeoutMs, overrideTimeoutMs)
			: timeoutMs,
	);
	const proc = Bun.spawn(["sh", "-c", command], {
		cwd: root,
		env: { ...process.env, CI: process.env.CI ?? "" },
		stdout: "pipe",
		stderr: "pipe",
		detached: true,
	});
	const pgid = proc.pid;
	registry.add(pgid);
	let killedByTimer = false;
	const timer = setTimeout(() => {
		killedByTimer = true;
		killProcessGroup(pgid, "SIGKILL");
	}, effectiveTimeout);

	let output = "";
	const pump = async (
		stream: ReadableStream<Uint8Array> | undefined,
		target: typeof process.stdout,
	) => {
		if (!stream) return;
		const decoder = new TextDecoder();
		for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
			const text = decoder.decode(chunk, { stream: true });
			output += text;
			target.write(text);
		}
	};
	await Promise.all([
		pump(proc.stdout as ReadableStream<Uint8Array>, process.stdout),
		pump(proc.stderr as ReadableStream<Uint8Array>, process.stderr),
	]);
	const code = await proc.exited;
	if (timer) clearTimeout(timer);
	registry.remove(pgid);
	const ms = performance.now() - started;

	if (code === 124 || code === 137 || killedByTimer) {
		return {
			label,
			command,
			outcome: "timeout",
			ms,
			note: `exceeded ${effectiveTimeout < 1000 ? `${effectiveTimeout}ms` : `${Math.round(effectiveTimeout / 1000)}s`}`,
		};
	}
	if (code !== 0) {
		return { label, command, outcome: "fail", ms, note: `exit ${code}` };
	}
	if (expect) {
		const plain = output.replace(ANSI, "");
		const matches = [...plain.matchAll(new RegExp(expect.pattern.source, "g"))];
		const count = matches.reduce((sum, match) => sum + Number(match[1] ?? 1), 0);
		if (count < expect.min) {
			return {
				label,
				command,
				outcome: "fail",
				ms,
				note: `empty run: ${count} ${expect.label} (need >= ${expect.min})`,
			};
		}
	}
	return { label, command, outcome: "pass", ms, note: "" };
}

function formatMs(ms: number): string {
	return `${(ms / 1000).toFixed(1)}s`;
}

const neededTools = new Map<string, number>();
for (const slot of selected) {
	if (slot.id === "G1") neededTools.set("gitleaks", 0);
	if (slot.id === "G2") neededTools.set("osv", 0);
	if (slot.id === "S3") neededTools.set("actionlint", 0);
}

const checks = await preflight(root, new Set(neededTools.keys()));
for (const key of neededTools.keys()) {
	checks.push(await checkTool(key as "gitleaks" | "osv" | "actionlint"));
}

console.log("▸ preflight");
let preflightOk = true;
for (const check of checks) {
	console.log(`  ${check.ok ? "✓" : "✗"} ${check.name}: ${check.detail}`);
	if (!check.ok) preflightOk = false;
}
if (!preflightOk) {
	console.error(`\n❌ ${stage}: preflight failed`);
	process.exit(1);
}

const results: SlotResult[] = [];
let abortAfter: string | undefined;

async function executeSlot(slot: SlotDefinition): Promise<SlotResult> {
	if (performance.now() - startedAt > effectiveStageBudgetMs) {
		return {
			slot,
			outcome: "timeout",
			ms: 0,
			steps: [],
			note: `stage budget ${Math.round(effectiveStageBudgetMs / 1000)}s exceeded before this slot`,
		};
	}
	if (slot.stagedOnly && !stagedPaths.some((path) => slot.stagedOnly?.test(path))) {
		console.log(`\n▸ ${slot.name} — skipped (no matching staged change)`);
		return { slot, outcome: "skip", ms: 0, steps: [], note: "no staged change" };
	}

	const steps = slot.stepsFor?.({ root, gitRoot, g1Range }) ?? slot.steps ?? [];
	console.log(`\n▸ ${slot.name} — ${slot.target}`);
	const slotStarted = performance.now();
	const stepResults: StepResult[] = [];
	for (const [index, step] of steps.entries()) {
		const remainingMs = effectiveStageBudgetMs - (performance.now() - startedAt);
		if (remainingMs <= 0) {
			stepResults.push({
				label: step.label,
				command: step.command,
				outcome: "timeout",
				ms: 0,
				note: "stage budget exhausted before this step",
			});
			console.log(`  ✗ ${step.label} — stage budget exhausted before this step`);
			for (const rest of steps.slice(index + 1)) {
				stepResults.push({
					label: rest.label,
					command: rest.command,
					outcome: "skip",
					ms: 0,
					note: "not run",
				});
			}
			break;
		}
		console.log(`  $ ${step.command}`);
		const result = await runStep(
			step.command,
			Math.min(step.timeoutMs, remainingMs),
			step.expect,
			step.label,
		);
		stepResults.push(result);
		console.log(
			`  ${result.outcome === "pass" ? "✓" : "✗"} ${result.label} ${formatMs(result.ms)}${result.note ? ` — ${result.note}` : ""}`,
		);
		if (result.outcome !== "pass") {
			for (const rest of steps.slice(index + 1)) {
				stepResults.push({
					label: rest.label,
					command: rest.command,
					outcome: "skip",
					ms: 0,
					note: "not run",
				});
			}
			break;
		}
	}
	const failed = stepResults.find((step) => step.outcome === "fail" || step.outcome === "timeout");
	return {
		slot,
		outcome: failed ? failed.outcome : "pass",
		ms: performance.now() - slotStarted,
		steps: stepResults,
		note: failed?.note ?? "",
	};
}

const prePushSerial = stage === "pre-push" ? new Set(["G1", "G2", "B1"]) : undefined;
const serial = prePushSerial ? selected.filter((slot) => prePushSerial.has(slot.id)) : selected;
const parallel = prePushSerial ? selected.filter((slot) => !prePushSerial.has(slot.id)) : [];

for (const slot of serial) {
	if (abortAfter) {
		results.push({
			slot,
			outcome: "skip",
			ms: 0,
			steps: [],
			note: `not run after ${abortAfter} failed`,
		});
		continue;
	}
	const result = await executeSlot(slot);
	results.push(result);
	if (result.outcome === "fail" || result.outcome === "timeout") {
		abortAfter = slot.id;
	}
}

if (parallel.length > 0) {
	if (abortAfter) {
		for (const slot of parallel) {
			results.push({
				slot,
				outcome: "skip",
				ms: 0,
				steps: [],
				note: `not run after ${abortAfter} failed`,
			});
		}
	} else {
		results.push(...(await Promise.all(parallel.map((slot) => executeSlot(slot)))));
	}
}

const totalMs = performance.now() - startedAt;
console.log(`\n${"─".repeat(78)}`);
console.log(`System0 ${stage} gate — ${root}`);
console.log(`${"ID".padEnd(4)}${"SLOT".padEnd(17)}${"RESULT".padEnd(9)}${"TIME".padEnd(8)}TARGET`);
for (const result of results) {
	console.log(
		`${result.slot.id.padEnd(4)}${result.slot.name.slice(4).padEnd(17)}${result.outcome.toUpperCase().padEnd(9)}${formatMs(result.ms).padEnd(8)}${result.slot.target}`,
	);
}
for (const result of results) {
	if (result.note) console.log(`  ${result.slot.id}: ${result.note}`);
}
for (const entry of NOT_APPLICABLE) {
	console.log(
		`${entry.id.padEnd(4)}${entry.name.slice(4).padEnd(17)}${"N/A".padEnd(9)}${"-".padEnd(8)}${entry.reason}`,
	);
}
console.log(`${"─".repeat(78)}`);
console.log(
	`total ${formatMs(totalMs)} (stage budget ${Math.round(effectiveStageBudgetMs / 1000)}s)`,
);

const failedSlots = results.filter(
	(result) => result.outcome === "fail" || result.outcome === "timeout",
);
if (failedSlots.length > 0) {
	console.error(
		`\n❌ ${stage} gate failed: ${failedSlots.map((result) => `${result.slot.id} (${result.outcome}${result.note ? `: ${result.note}` : ""})`).join(", ")}`,
	);
	process.exit(1);
}
if (results.every((result) => result.outcome === "skip")) {
	console.error(`\n❌ ${stage} gate failed: no slot ran`);
	process.exit(1);
}
if (totalMs > effectiveStageBudgetMs) {
	console.error(
		`\n❌ ${stage} gate failed: stage budget ${effectiveStageBudgetMs}ms exceeded (${Math.round(totalMs)}ms)`,
	);
	process.exit(1);
}
console.log(`\n✅ ${stage} gate passed`);
