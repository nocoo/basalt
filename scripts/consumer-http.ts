import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { join } from "node:path";

export const NEXT_HTTP_MARKER = "basalt-next19-ok";

export function allocatePort(host = "127.0.0.1"): Promise<number> {
	return new Promise((resolvePort, reject) => {
		const server = createServer();
		server.unref();
		server.once("error", reject);
		server.listen(0, host, () => {
			const address = server.address();
			if (!address || typeof address === "string") {
				server.close();
				reject(new Error("failed to allocate port"));
				return;
			}
			const port = address.port;
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}
				resolvePort(port);
			});
		});
	});
}

export function earlyExitError(
	code: number | null,
	signal: NodeJS.Signals | null,
	stdout: string,
	stderr: string,
) {
	return new Error(`next start exited code=${code} signal=${signal}\n${stdout}\n${stderr}`);
}

export function assertNextHttpBody(status: number, body: string, marker: string) {
	if (status !== 200) {
		throw new Error(`expected HTTP 200, got ${status}`);
	}
	if (!body.includes(marker)) {
		throw new Error(`missing HTTP marker ${marker}`);
	}
}

export async function waitForUrl(
	url: string,
	timeoutMs: number,
	options: {
		fetchImpl?: typeof fetch;
		delayMs?: number;
		isAborted?: () => boolean;
	} = {},
): Promise<Response> {
	const fetchImpl = options.fetchImpl ?? fetch;
	const delayMs = options.delayMs ?? 200;
	const deadline = Date.now() + timeoutMs;
	let lastError: unknown = new Error(`timed out waiting for ${url}`);
	while (Date.now() < deadline) {
		if (options.isAborted?.()) {
			throw lastError;
		}
		try {
			const response = await fetchImpl(url);
			if (response.status === 200) {
				return response;
			}
			lastError = new Error(`HTTP ${response.status}`);
		} catch (error) {
			lastError = error;
		}
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
	throw lastError;
}

export function nextStartLaunch(consumerRoot: string, port: number) {
	return {
		command: "node",
		args: [
			join(consumerRoot, "node_modules", "next", "dist", "bin", "next"),
			"start",
			"-p",
			String(port),
			"-H",
			"127.0.0.1",
		],
	};
}

export function processAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

export function listPidsMatching(needle: string): number[] {
	const result = spawnSync("/bin/ps", ["-ax", "-o", "pid=,command="], { encoding: "utf8" });
	if (result.status !== 0) {
		throw new Error(`ps failed: ${result.stderr}`);
	}
	const pids: number[] = [];
	for (const line of result.stdout.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed.includes(needle)) {
			continue;
		}
		const pid = Number(trimmed.split(/\s+/, 1)[0]);
		if (Number.isInteger(pid) && pid > 0 && pid !== process.pid) {
			pids.push(pid);
		}
	}
	return pids;
}

export function assertServerCleaned(pid: number | undefined, needles: string[]) {
	if (pid !== undefined && processAlive(pid)) {
		throw new Error(`server PID ${pid} still alive`);
	}
	const leftover = needles.flatMap((needle) => listPidsMatching(needle));
	if (leftover.length > 0) {
		throw new Error(`leftover processes ${leftover.join(", ")} for ${needles.join(", ")}`);
	}
}

function killTree(pid: number, signal: NodeJS.Signals) {
	try {
		process.kill(-pid, signal);
		return;
	} catch {
		try {
			process.kill(pid, signal);
		} catch {
			return;
		}
	}
}

export function stopChild(child: ChildProcess, timeoutMs = 8000): Promise<void> {
	return new Promise((resolve) => {
		if (child.exitCode !== null || child.signalCode !== null) {
			resolve();
			return;
		}
		const pid = child.pid;
		const timer = setTimeout(() => {
			if (pid !== undefined) {
				killTree(pid, "SIGKILL");
			} else {
				child.kill("SIGKILL");
			}
		}, timeoutMs);
		child.once("exit", () => {
			clearTimeout(timer);
			resolve();
		});
		if (pid !== undefined) {
			killTree(pid, "SIGTERM");
		} else {
			child.kill("SIGTERM");
		}
	});
}

export async function startHttpServer(options: {
	cwd: string;
	command: string;
	args: string[];
	url: string;
	env?: NodeJS.ProcessEnv;
	timeoutMs?: number;
	needles?: string[];
}): Promise<{ child: ChildProcess; response: Response; stdout: string; stderr: string }> {
	const child = spawn(options.command, options.args, {
		cwd: options.cwd,
		env: { ...process.env, NODE_PATH: "", ...options.env },
		stdio: ["ignore", "pipe", "pipe"],
		detached: true,
	});
	let stdout = "";
	let stderr = "";
	let exited = false;
	child.stdout?.on("data", (chunk) => {
		stdout += String(chunk);
	});
	child.stderr?.on("data", (chunk) => {
		stderr += String(chunk);
	});
	child.once("exit", () => {
		exited = true;
	});
	try {
		const response = await waitForUrl(options.url, options.timeoutMs ?? 60_000, {
			isAborted: () => exited,
		});
		return { child, response, stdout, stderr };
	} catch (error) {
		await stopChild(child);
		assertServerCleaned(child.pid, options.needles ?? []);
		if (exited) {
			throw earlyExitError(child.exitCode, child.signalCode, stdout, stderr);
		}
		throw error;
	}
}
