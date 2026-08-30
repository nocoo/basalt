import { type ChildProcess, spawn } from "node:child_process";
import { createServer } from "node:net";

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

export function stopChild(child: ChildProcess, timeoutMs = 8000): Promise<void> {
	return new Promise((resolve) => {
		if (child.exitCode !== null || child.signalCode !== null) {
			resolve();
			return;
		}
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
		}, timeoutMs);
		child.once("exit", () => {
			clearTimeout(timer);
			resolve();
		});
		child.kill("SIGTERM");
	});
}

export async function startHttpServer(options: {
	cwd: string;
	command: string;
	args: string[];
	url: string;
	env?: NodeJS.ProcessEnv;
	timeoutMs?: number;
}): Promise<{ child: ChildProcess; response: Response; stdout: string; stderr: string }> {
	const child = spawn(options.command, options.args, {
		cwd: options.cwd,
		env: { ...process.env, NODE_PATH: "", ...options.env },
		stdio: ["ignore", "pipe", "pipe"],
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
		if (exited) {
			throw earlyExitError(child.exitCode, child.signalCode, stdout, stderr);
		}
		throw error;
	}
}
