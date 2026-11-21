import { type ChildProcess, spawn } from "node:child_process";
import { killProcessGroup } from "./quality/process";

export type PrepublishStep = {
	id: string;
	command: string;
	args: string[];
	env?: Record<string, string>;
};

export const PREPUBLISH_STAGE_1: readonly PrepublishStep[] = [
	{ id: "typecheck", command: "bun", args: ["run", "typecheck"] },
	{ id: "lint", command: "bun", args: ["run", "lint"] },
	{ id: "package-build", command: "bun", args: ["run", "--cwd", "packages/basalt", "build"] },
];

export const PREPUBLISH_STAGE_2: readonly PrepublishStep[] = [
	{
		id: "gate-showcase",
		command: "bun",
		args: ["run", "test:showcase"],
		env: { BASALT_SHOWCASE_WORKERS: "2" },
	},
	{ id: "coverage", command: "bun", args: ["run", "test:coverage"] },
	{
		id: "gate-c",
		command: "bun",
		args: ["run", "consumer:next"],
		env: { BASALT_SKIP_PACKAGE_BUILD: "1" },
	},
	{ id: "gate-layouts", command: "bun", args: ["run", "test:layouts"] },
	{
		id: "gate-a",
		command: "bun",
		args: ["run", "consumer:tailwind"],
		env: { BASALT_SKIP_PACKAGE_BUILD: "1" },
	},
	{
		id: "gate-b",
		command: "bun",
		args: ["run", "consumer:standalone"],
		env: { BASALT_SKIP_PACKAGE_BUILD: "1" },
	},
	{
		id: "gate-d",
		command: "bun",
		args: ["run", "consumer:heavy"],
		env: { BASALT_SKIP_PACKAGE_BUILD: "1" },
	},
	{ id: "gate-docs", command: "bun", args: ["run", "consumer:docs"] },
	{ id: "package-types", command: "bun", args: ["run", "--cwd", "packages/basalt", "types:check"] },
	{ id: "package-pack", command: "bun", args: ["run", "--cwd", "packages/basalt", "pack:check"] },
	{ id: "package-publint", command: "bun", args: ["run", "--cwd", "packages/basalt", "publint"] },
];

const DEFAULT_CONCURRENCY = 3;

type StepResult = {
	id: string;
	durationMs: number;
};

function formatSeconds(ms: number): string {
	return `${(ms / 1000).toFixed(1)}s`;
}

function runStep(step: PrepublishStep, activeChildren: Set<ChildProcess>): Promise<StepResult> {
	const startedAt = Date.now();
	return new Promise((resolve, reject) => {
		const child = spawn(step.command, step.args, {
			cwd: process.cwd(),
			env: { ...process.env, ...step.env },
			detached: true,
			stdio: ["ignore", "pipe", "pipe"],
		});
		activeChildren.add(child);
		const chunks: Buffer[] = [];
		child.stdout?.on("data", (chunk: Buffer) => chunks.push(chunk));
		child.stderr?.on("data", (chunk: Buffer) => chunks.push(chunk));
		child.on("error", (error) => {
			activeChildren.delete(child);
			reject(new Error(`[${step.id}] failed to spawn: ${error.message}`));
		});
		child.on("close", (code, signal) => {
			activeChildren.delete(child);
			const durationMs = Date.now() - startedAt;
			if (code === 0) {
				console.log(`  ✓ ${step.id} (${formatSeconds(durationMs)})`);
				resolve({ id: step.id, durationMs });
				return;
			}
			const output = Buffer.concat(chunks).toString("utf8").trim();
			const tail = output.length > 4000 ? output.slice(-4000) : output;
			const reason = signal ? `signal ${signal}` : `exit code ${code ?? 1}`;
			reject(
				new Error(
					`[${step.id}] failed (${reason}) after ${formatSeconds(durationMs)}${tail ? `\n${tail}` : ""}`,
				),
			);
		});
	});
}

function terminateAll(activeChildren: Set<ChildProcess>): void {
	for (const child of activeChildren) {
		if (child.pid) {
			killProcessGroup(child.pid, "SIGTERM");
		}
	}
}

async function runPool(
	steps: readonly PrepublishStep[],
	concurrency: number,
	activeChildren: Set<ChildProcess>,
): Promise<StepResult[]> {
	const results: StepResult[] = [];
	let cursor = 0;
	let firstError: unknown;

	const worker = async () => {
		while (cursor < steps.length && firstError === undefined) {
			const step = steps[cursor++];
			try {
				results.push(await runStep(step, activeChildren));
			} catch (error) {
				if (firstError === undefined) {
					firstError = error;
					terminateAll(activeChildren);
				}
				return;
			}
		}
	};

	await Promise.all(Array.from({ length: Math.min(concurrency, steps.length) }, worker));
	if (firstError !== undefined) {
		throw firstError;
	}
	return results;
}

export async function runPrepublish(): Promise<void> {
	const startedAt = Date.now();
	const activeChildren = new Set<ChildProcess>();
	const onSignal = (signal: NodeJS.Signals) => {
		terminateAll(activeChildren);
		process.exit(signal === "SIGTERM" ? 143 : 130);
	};
	process.once("SIGINT", onSignal);
	process.once("SIGTERM", onSignal);

	try {
		const rawConcurrency = Number(process.env.BASALT_PREPUBLISH_CONCURRENCY);
		const concurrency =
			Number.isInteger(rawConcurrency) && rawConcurrency > 0 ? rawConcurrency : DEFAULT_CONCURRENCY;

		console.log("▸ package:prepublish stage 1/2 (typecheck, lint, package-build)");
		await runPool(PREPUBLISH_STAGE_1, PREPUBLISH_STAGE_1.length, activeChildren);

		console.log(
			`▸ package:prepublish stage 2/2 (${PREPUBLISH_STAGE_2.length} gates, concurrency=${concurrency})`,
		);
		await runPool(PREPUBLISH_STAGE_2, concurrency, activeChildren);

		console.log(`✅ package:prepublish passed in ${formatSeconds(Date.now() - startedAt)}`);
	} finally {
		process.off("SIGINT", onSignal);
		process.off("SIGTERM", onSignal);
		terminateAll(activeChildren);
	}
}

if (import.meta.main) {
	await runPrepublish();
}
