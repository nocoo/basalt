import { describe, expect, it } from "vitest";
import {
	assertNextHttpBody,
	assertServerCleaned,
	earlyExitError,
	listPidsMatching,
	NEXT_HTTP_MARKER,
	nextStartLaunch,
	startHttpServer,
	stopChild,
	waitForUrl,
} from "./consumer-http";

describe("consumer http helpers", () => {
	it("retries until the url returns 200", async () => {
		let attempts = 0;
		const fetchImpl = async () => {
			attempts += 1;
			if (attempts < 3) {
				throw new Error("ECONNREFUSED");
			}
			return new Response("ok", { status: 200 });
		};
		const response = await waitForUrl("http://127.0.0.1:9/", 1000, {
			fetchImpl,
			delayMs: 1,
		});
		expect(response.status).toBe(200);
		expect(attempts).toBe(3);
	});

	it("surfaces the last connection error when the server exits", async () => {
		let attempts = 0;
		await expect(
			waitForUrl("http://127.0.0.1:9/", 1000, {
				fetchImpl: async () => {
					attempts += 1;
					throw new Error("ECONNREFUSED");
				},
				delayMs: 1,
				isAborted: () => attempts > 0,
			}),
		).rejects.toThrow(/ECONNREFUSED/);
	});

	it("requires HTTP 200 and the marker", () => {
		expect(() => assertNextHttpBody(500, NEXT_HTTP_MARKER, NEXT_HTTP_MARKER)).toThrow(/200/);
		expect(() => assertNextHttpBody(200, "nope", NEXT_HTTP_MARKER)).toThrow(/marker/);
		expect(() =>
			assertNextHttpBody(200, `hello ${NEXT_HTTP_MARKER}`, NEXT_HTTP_MARKER),
		).not.toThrow();
	});

	it("keeps stderr when next start exits early", () => {
		expect(earlyExitError(1, null, "out", "server crashed").message).toContain("server crashed");
	});

	it("resolves stopChild when the process already exited", async () => {
		const child = {
			exitCode: 0,
			signalCode: null,
			kill() {},
			once() {},
		};
		await stopChild(child as never);
	});

	it("launches Next with node and the package bin", () => {
		const launch = nextStartLaunch("/tmp/consumer", 3210);
		expect(launch.command).toBe("node");
		expect(launch.args).toEqual([
			"/tmp/consumer/node_modules/next/dist/bin/next",
			"start",
			"-p",
			"3210",
			"-H",
			"127.0.0.1",
		]);
		expect(launch.command).not.toBe("npm");
		expect(launch.args.join(" ")).not.toContain("run start");
	});

	it("stops a real child when readiness times out", async () => {
		const unique = `basalt-timeout-${Date.now()}`;
		const startedAt = Date.now();
		await expect(
			startHttpServer({
				cwd: process.cwd(),
				command: "node",
				args: ["-e", `setTimeout(() => {}, 1200); // ${unique}`],
				url: "http://127.0.0.1:1/",
				timeoutMs: 200,
				needles: [unique],
			}),
		).rejects.toThrow();
		expect(Date.now() - startedAt).toBeLessThan(900);
		expect(listPidsMatching(unique)).toEqual([]);
		expect(() => assertServerCleaned(undefined, [unique])).not.toThrow();
	});

	it("cleans up after a real early exit", async () => {
		const unique = `basalt-early-${Date.now()}`;
		await expect(
			startHttpServer({
				cwd: process.cwd(),
				command: "node",
				args: ["-e", `process.exit(7); // ${unique}`],
				url: "http://127.0.0.1:1/",
				timeoutMs: 1000,
				needles: [unique],
			}),
		).rejects.toThrow(/exited code=7/);
		expect(listPidsMatching(unique)).toEqual([]);
	});

	it("rethrows the original readiness error for a live child", async () => {
		const unique = `basalt-readyfail-${Date.now()}`;
		const readinessError = new Error("basalt-readiness-fail");
		let livePid: number | undefined;
		await expect(
			startHttpServer({
				cwd: process.cwd(),
				command: "node",
				args: ["-e", `setTimeout(() => {}, 5000); // ${unique}`],
				url: "http://127.0.0.1:1/",
				timeoutMs: 200,
				needles: [unique],
				fetchImpl: async () => {
					const pids = listPidsMatching(unique);
					if (pids.length > 0) {
						livePid = pids[0];
					}
					throw readinessError;
				},
			}),
		).rejects.toBe(readinessError);
		expect(livePid).toEqual(expect.any(Number));
		expect(() => assertServerCleaned(livePid, [unique])).not.toThrow();
		expect(listPidsMatching(unique)).toEqual([]);
	});

	it("sends SIGTERM and escalates to SIGKILL", async () => {
		const signals: string[] = [];
		let onExit: (() => void) | undefined;
		const child = {
			exitCode: null,
			signalCode: null,
			kill(signal?: NodeJS.Signals) {
				signals.push(signal ?? "SIGTERM");
				if (signal === "SIGKILL") {
					onExit?.();
				}
			},
			once(_event: string, callback: () => void) {
				onExit = callback;
			},
		};
		await stopChild(child as never, 20);
		expect(signals[0]).toBe("SIGTERM");
		expect(signals).toContain("SIGKILL");
	});
});
