import { describe, expect, it } from "vitest";
import {
	assertNextHttpBody,
	earlyExitError,
	NEXT_HTTP_MARKER,
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
