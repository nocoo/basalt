import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { killProcessGroup, PgidRegistry } from "./process";

export interface ToolCheck {
	name: string;
	ok: boolean;
	detail: string;
}

interface ToolSpec {
	bin: string;
	args: string[];
	minimum: string;
	pattern: RegExp;
}

const TOOLS: Record<string, ToolSpec> = {
	gitleaks: { bin: "gitleaks", args: ["version"], minimum: "8.30.1", pattern: /(\d+\.\d+\.\d+)/ },
	osv: {
		bin: "osv-scanner",
		args: ["--version"],
		minimum: "2.5.1",
		pattern: /osv-scanner version:\s*(\d+\.\d+\.\d+)/,
	},
	actionlint: {
		bin: "actionlint",
		args: ["--version"],
		minimum: "1.7.12",
		pattern: /(\d+\.\d+\.\d+)/,
	},
};

export function compareVersions(a: string, b: string): number {
	const left = a.split(".").map(Number);
	const right = b.split(".").map(Number);
	for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
		const diff = (left[index] ?? 0) - (right[index] ?? 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

const TOOL_TIMEOUT_MS = 60_000;
const LOCKFILE_TIMEOUT_MS = 120_000;

export function toolTimeoutMs(): number {
	const override = Number.parseInt(process.env.GATE_TOOL_TIMEOUT_MS ?? "", 10);
	return Number.isFinite(override) && override > 0 ? override : TOOL_TIMEOUT_MS;
}

async function run(bin: string, args: string[], timeoutMs = toolTimeoutMs()) {
	const binary = Bun.which(bin);
	if (!binary) return undefined;
	const proc = Bun.spawn([binary, ...args], {
		stdout: "pipe",
		stderr: "pipe",
		detached: true,
	});
	const pgid = proc.pid;
	const registry = new PgidRegistry();
	registry.add(pgid);
	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		killProcessGroup(pgid, "SIGKILL");
	}, timeoutMs);
	const [stdout, stderr] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	const code = await proc.exited;
	clearTimeout(timer);
	registry.remove(pgid);
	return { code, text: `${stdout}\n${stderr}`, timedOut };
}

export async function checkTool(key: keyof typeof TOOLS): Promise<ToolCheck> {
	const spec = TOOLS[key];
	const result = await run(spec.bin, spec.args);
	if (!result) {
		return {
			name: key,
			ok: false,
			detail: `${spec.bin} not found on PATH (need >= ${spec.minimum})`,
		};
	}
	if (result.timedOut) {
		return {
			name: key,
			ok: false,
			detail: `${spec.bin} did not answer within ${toolTimeoutMs()}ms`,
		};
	}
	const match = spec.pattern.exec(result.text);
	if (!match) {
		return { name: key, ok: false, detail: `${spec.bin} printed no version` };
	}
	const version = match[1];
	if (compareVersions(version, spec.minimum) < 0) {
		return { name: key, ok: false, detail: `${spec.bin} ${version} < required ${spec.minimum}` };
	}
	return { name: key, ok: true, detail: `${spec.bin} ${version}` };
}

export function declaredPackageManager(
	root: string,
): { name: string; version: string } | undefined {
	const manifest = join(root, "package.json");
	if (!existsSync(manifest)) return undefined;
	const packageManager = (JSON.parse(readFileSync(manifest, "utf8")) as { packageManager?: string })
		.packageManager;
	if (!packageManager) return undefined;
	const [name, version] = packageManager.split("@");
	return name && version ? { name, version } : undefined;
}

export async function checkBun(root: string): Promise<ToolCheck> {
	const declared = declaredPackageManager(root);
	const result = await run("bun", ["--version"]);
	if (result?.timedOut) {
		return { name: "bun", ok: false, detail: `bun did not answer within ${toolTimeoutMs()}ms` };
	}
	if (result?.code !== 0) {
		return { name: "bun", ok: false, detail: "bun is required" };
	}
	const actual = result.text.trim().split("\n")[0].trim();
	if (declared?.name !== "bun") {
		return { name: "bun", ok: true, detail: `${actual} (no bun packageManager declaration)` };
	}
	const declaredParts = declared.version.split(".");
	const compatible =
		actual === declared.version ||
		(declaredParts.length < 3 && actual.startsWith(`${declared.version}.`)) ||
		actual.split(".").slice(0, 2).join(".") === declaredParts.slice(0, 2).join(".");
	return {
		name: "bun",
		ok: compatible,
		detail: compatible
			? `${actual} matches packageManager bun@${declared.version}`
			: `${actual} does not match packageManager bun@${declared.version}; run bun install`,
	};
}

export async function checkNode(): Promise<ToolCheck> {
	const result = await run("node", ["--version"]);
	if (result?.timedOut) {
		return { name: "node", ok: false, detail: `node did not answer within ${toolTimeoutMs()}ms` };
	}
	if (result?.code !== 0) {
		return { name: "node", ok: false, detail: "node is required" };
	}
	const actual = result.text.trim().replace(/^v/, "");
	return {
		name: "node",
		ok: compareVersions(actual, "26.0.0") >= 0,
		detail: `node ${actual}${compareVersions(actual, "26.0.0") >= 0 ? "" : " < required 26"}`,
	};
}

export async function verifyLockfile(root: string): Promise<ToolCheck> {
	const manifest = join(root, "package.json");
	const lockfile = join(root, "bun.lock");
	if (!existsSync(manifest) || !existsSync(lockfile)) {
		return { name: "lockfile", ok: false, detail: "package.json and bun.lock are required" };
	}
	const timeoutMs = LOCKFILE_TIMEOUT_MS;
	const proc = Bun.spawn(["bun", "install", "--frozen-lockfile", "--dry-run"], {
		cwd: root,
		stdout: "ignore",
		stderr: "ignore",
		detached: true,
	});
	const pgid = proc.pid;
	const registry = new PgidRegistry();
	registry.add(pgid);
	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		killProcessGroup(pgid, "SIGKILL");
	}, timeoutMs);
	const code = await proc.exited;
	clearTimeout(timer);
	registry.remove(pgid);
	return {
		name: "lockfile",
		ok: code === 0,
		detail:
			code === 0
				? "bun.lock matches package.json"
				: timedOut
					? `bun install --frozen-lockfile --dry-run timed out after ${timeoutMs}ms`
					: "bun install --frozen-lockfile --dry-run failed; run bun install and commit the lockfile",
	};
}
